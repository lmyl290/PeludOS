from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.pedido import PedidoCreate, PedidoUpdate, PedidoResponse, DetallePedidoResponse
from app.crud.pedido import (
    get_pedido_by_id,
    get_pedidos_by_usuario,
    get_pedidos_by_veterinaria,
    get_pedidos,
    get_detalles_pedido,
    crear_pedido_con_detalles,
    actualizar_pedido,
)
from app.crud.carrito import get_carrito_activo, get_items_carrito, marcar_carrito_completado
from app.crud.producto import get_producto_by_id
from app.crud.profesional import get_profesional_by_usuario
from app.core.security import get_current_user

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

# Campos que un cliente puede tocar en su propio pedido: solo cancelarlo mientras esté pendiente.
_CAMPOS_PERMITIDOS_CLIENTE = {"estado_pedido"}


def _construir_respuesta_pedido(db: Session, pedido) -> PedidoResponse:
    detalles = get_detalles_pedido(db, pedido.id_pedido)
    return PedidoResponse(
        id_pedido=pedido.id_pedido,
        id_usuario=pedido.id_usuario,
        id_veterinaria=pedido.id_veterinaria,
        id_carrito=pedido.id_carrito,
        fecha_pedido=pedido.fecha_pedido,
        total=pedido.total,
        estado_pedido=pedido.estado_pedido,
        metodo_pago=pedido.metodo_pago,
        direccion_entrega=pedido.direccion_entrega,
        notas=pedido.notas,
        fecha_entrega=pedido.fecha_entrega,
        detalles=[DetallePedidoResponse.model_validate(detalle) for detalle in detalles],
    )


@router.post("", response_model=PedidoResponse, status_code=status.HTTP_201_CREATED)
def create_pedido_checkout(
    pedido_data: PedidoCreate,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Hace checkout del carrito activo del usuario: valida stock, lo descuenta y crea el pedido."""
    carrito = get_carrito_activo(db, usuario_actual.id_usuario)
    if not carrito:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No tienes un carrito activo")

    items = get_items_carrito(db, carrito.id_carrito)
    if not items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tu carrito está vacío")

    productos = {item.id_producto: get_producto_by_id(db, item.id_producto) for item in items}

    ids_veterinarias = {producto.id_veterinaria for producto in productos.values() if producto}
    if len(ids_veterinarias) > 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El carrito tiene productos de más de una veterinaria; separa la compra por veterinaria",
        )

    for item in items:
        producto = productos.get(item.id_producto)
        if not producto or not producto.activo:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"El producto con id {item.id_producto} ya no está disponible",
            )
        if producto.stock < item.cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente para '{producto.nombre_producto}'",
            )

    total = sum(item.subtotal for item in items)
    items_snapshot = [
        {
            "id_producto": item.id_producto,
            "nombre_producto": productos[item.id_producto].nombre_producto,
            "cantidad": item.cantidad,
            "precio_unitario": item.precio_unitario,
            "subtotal": item.subtotal,
        }
        for item in items
    ]

    for item in items:
        productos[item.id_producto].stock -= item.cantidad

    id_veterinaria = ids_veterinarias.pop()
    nuevo_pedido = crear_pedido_con_detalles(
        db,
        id_usuario=usuario_actual.id_usuario,
        id_veterinaria=id_veterinaria,
        id_carrito=carrito.id_carrito,
        total=total,
        direccion_entrega=pedido_data.direccion_entrega,
        metodo_pago=pedido_data.metodo_pago,
        notas=pedido_data.notas,
        items_snapshot=items_snapshot,
    )
    marcar_carrito_completado(db, carrito)

    return _construir_respuesta_pedido(db, nuevo_pedido)


@router.get("", response_model=List[PedidoResponse])
def list_pedidos(
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lista pedidos según el rol: cliente ve los suyos, profesional los de su veterinaria, admin todos."""
    if usuario_actual.rol == "admin":
        pedidos = get_pedidos(db)
    elif usuario_actual.rol == "profesional":
        profesional = get_profesional_by_usuario(db, usuario_actual.id_usuario)
        pedidos = get_pedidos_by_veterinaria(db, profesional.id_veterinaria) if profesional else []
    else:
        pedidos = get_pedidos_by_usuario(db, usuario_actual.id_usuario)

    return [_construir_respuesta_pedido(db, pedido) for pedido in pedidos]


def _autorizacion_pedido(pedido, usuario_actual: Usuario, db: Session):
    """Devuelve (es_admin, es_dueno, es_profesional_veterinaria) para un pedido dado."""
    es_admin = usuario_actual.rol == "admin"
    es_dueno = pedido.id_usuario == usuario_actual.id_usuario
    profesional = get_profesional_by_usuario(db, usuario_actual.id_usuario)
    es_profesional_veterinaria = profesional is not None and profesional.id_veterinaria == pedido.id_veterinaria
    return es_admin, es_dueno, es_profesional_veterinaria


@router.get("/{id_pedido}", response_model=PedidoResponse)
def read_pedido(
    id_pedido: int,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Devuelve el detalle de un pedido (dueño, profesional de esa veterinaria, o admin)."""
    pedido = get_pedido_by_id(db, id_pedido)
    if not pedido:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")

    es_admin, es_dueno, es_profesional_veterinaria = _autorizacion_pedido(pedido, usuario_actual, db)
    if not (es_admin or es_dueno or es_profesional_veterinaria):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes acceso a este pedido")

    return _construir_respuesta_pedido(db, pedido)


@router.patch("/{id_pedido}", response_model=PedidoResponse)
def update_pedido_existente(
    id_pedido: int,
    pedido_data: PedidoUpdate,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Actualiza un pedido. El profesional de la veterinaria o un admin pueden modificar cualquier campo.
    El cliente (dueño) solo puede cancelar (`estado_pedido='cancelado'`) mientras siga 'pendiente'.
    """
    pedido = get_pedido_by_id(db, id_pedido)
    if not pedido:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado")

    es_admin, es_dueno, es_profesional_veterinaria = _autorizacion_pedido(pedido, usuario_actual, db)
    datos = pedido_data.model_dump(exclude_unset=True)

    if not (es_admin or es_profesional_veterinaria):
        if not es_dueno:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes acceso a este pedido")

        campos_no_permitidos = set(datos.keys()) - _CAMPOS_PERMITIDOS_CLIENTE
        if campos_no_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Como cliente solo puedes cancelar tu pedido",
            )
        if datos.get("estado_pedido") != "cancelado":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Como cliente solo puedes cambiar el estado a 'cancelado'",
            )
        if pedido.estado_pedido != "pendiente":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Solo puedes cancelar el pedido mientras esté en estado 'pendiente'",
            )

    actualizar_pedido(db, pedido, datos)
    return _construir_respuesta_pedido(db, pedido)
