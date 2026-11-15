from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.carrito import ItemCarritoCreate, ItemCarritoUpdate, CarritoResponse, DetalleCarritoResponse
from app.crud.carrito import (
    obtener_o_crear_carrito_activo,
    get_items_carrito,
    get_item_carrito_by_id,
    get_item_por_producto,
    agregar_item_carrito,
    actualizar_cantidad_item,
    eliminar_item_carrito,
)
from app.crud.producto import get_producto_by_id
from app.core.security import get_current_user

router = APIRouter(prefix="/carrito", tags=["Carrito"])


def _construir_respuesta_carrito(carrito, items) -> CarritoResponse:
    return CarritoResponse(
        id_carrito=carrito.id_carrito,
        id_usuario=carrito.id_usuario,
        estado=carrito.estado,
        fecha_creacion=carrito.fecha_creacion,
        items=[DetalleCarritoResponse.model_validate(item) for item in items],
    )


@router.get("", response_model=CarritoResponse)
def read_carrito(
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Devuelve (o crea) el carrito activo del usuario autenticado."""
    carrito = obtener_o_crear_carrito_activo(db, usuario_actual.id_usuario)
    items = get_items_carrito(db, carrito.id_carrito)
    return _construir_respuesta_carrito(carrito, items)


@router.post("/items", response_model=CarritoResponse, status_code=status.HTTP_201_CREATED)
def add_item_carrito(
    item_data: ItemCarritoCreate,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Agrega un producto al carrito activo (o suma la cantidad si ya estaba agregado)."""
    producto = get_producto_by_id(db, item_data.id_producto)
    if not producto or not producto.activo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El producto indicado no existe")

    carrito = obtener_o_crear_carrito_activo(db, usuario_actual.id_usuario)
    item_existente = get_item_por_producto(db, carrito.id_carrito, item_data.id_producto)
    if item_existente:
        actualizar_cantidad_item(db, item_existente, item_existente.cantidad + item_data.cantidad)
    else:
        agregar_item_carrito(db, carrito.id_carrito, item_data.id_producto, item_data.cantidad, producto.precio_venta)

    items = get_items_carrito(db, carrito.id_carrito)
    return _construir_respuesta_carrito(carrito, items)


def _obtener_item_propio(db: Session, id_detalle_carrito: int, usuario_actual: Usuario):
    """Busca la línea de carrito y valida que pertenezca al carrito activo del usuario."""
    item = get_item_carrito_by_id(db, id_detalle_carrito)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ítem de carrito no encontrado")
    carrito = obtener_o_crear_carrito_activo(db, usuario_actual.id_usuario)
    if item.id_carrito != carrito.id_carrito:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes acceso a este ítem")
    return item


@router.patch("/items/{id_detalle_carrito}", response_model=CarritoResponse)
def update_item_carrito(
    id_detalle_carrito: int,
    item_data: ItemCarritoUpdate,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Actualiza la cantidad de un ítem del carrito propio."""
    item = _obtener_item_propio(db, id_detalle_carrito, usuario_actual)
    actualizar_cantidad_item(db, item, item_data.cantidad)

    carrito = obtener_o_crear_carrito_activo(db, usuario_actual.id_usuario)
    items = get_items_carrito(db, carrito.id_carrito)
    return _construir_respuesta_carrito(carrito, items)


@router.delete("/items/{id_detalle_carrito}", response_model=CarritoResponse)
def remove_item_carrito(
    id_detalle_carrito: int,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Quita un ítem del carrito propio."""
    item = _obtener_item_propio(db, id_detalle_carrito, usuario_actual)
    eliminar_item_carrito(db, item)

    carrito = obtener_o_crear_carrito_activo(db, usuario_actual.id_usuario)
    items = get_items_carrito(db, carrito.id_carrito)
    return _construir_respuesta_carrito(carrito, items)
