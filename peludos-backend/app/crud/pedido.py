from decimal import Decimal
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.pedido import Pedido
from app.models.detalle_pedido import DetallePedido


def get_pedido_by_id(db: Session, id_pedido: int) -> Optional[Pedido]:
    """Busca un pedido por su ID."""
    return db.query(Pedido).filter(Pedido.id_pedido == id_pedido).first()


def get_pedidos_by_usuario(db: Session, id_usuario: int) -> List[Pedido]:
    """Lista los pedidos de un usuario (rol cliente)."""
    return db.query(Pedido).filter(Pedido.id_usuario == id_usuario).all()


def get_pedidos_by_veterinaria(db: Session, id_veterinaria: int) -> List[Pedido]:
    """Lista los pedidos de una veterinaria (rol profesional)."""
    return db.query(Pedido).filter(Pedido.id_veterinaria == id_veterinaria).all()


def get_pedidos(db: Session) -> List[Pedido]:
    """Lista todos los pedidos (rol admin)."""
    return db.query(Pedido).all()


def existe_pedido_entre_cliente_y_veterinaria(db: Session, id_usuario_cliente: int, id_veterinaria: int) -> bool:
    """Indica si el cliente ya hizo algún pedido a esa veterinaria."""
    return (
        db.query(Pedido)
        .filter(Pedido.id_usuario == id_usuario_cliente, Pedido.id_veterinaria == id_veterinaria)
        .first()
        is not None
    )


def get_detalles_pedido(db: Session, id_pedido: int) -> List[DetallePedido]:
    """Lista las líneas (snapshot) de un pedido."""
    return db.query(DetallePedido).filter(DetallePedido.id_pedido == id_pedido).all()


def crear_pedido_con_detalles(
    db: Session,
    id_usuario: int,
    id_veterinaria: int,
    id_carrito: int,
    total: Decimal,
    direccion_entrega: str,
    metodo_pago: Optional[str],
    notas: Optional[str],
    items_snapshot: list,
) -> Pedido:
    """Crea el pedido y sus líneas de detalle (snapshot de precio/cantidad) en una sola operación."""
    nuevo_pedido = Pedido(
        id_usuario=id_usuario,
        id_veterinaria=id_veterinaria,
        id_carrito=id_carrito,
        total=total,
        direccion_entrega=direccion_entrega,
        metodo_pago=metodo_pago,
        notas=notas,
    )
    db.add(nuevo_pedido)
    db.flush()  # asigna id_pedido antes de crear las líneas de detalle

    for item in items_snapshot:
        db.add(
            DetallePedido(
                id_pedido=nuevo_pedido.id_pedido,
                id_producto=item["id_producto"],
                nombre_producto=item["nombre_producto"],
                cantidad=item["cantidad"],
                precio_unitario=item["precio_unitario"],
                subtotal=item["subtotal"],
            )
        )

    db.commit()
    db.refresh(nuevo_pedido)
    return nuevo_pedido


def actualizar_pedido(db: Session, pedido: Pedido, datos: dict) -> Pedido:
    """Actualiza los campos ya validados/filtrados por el router según el rol del solicitante."""
    for campo, valor in datos.items():
        setattr(pedido, campo, valor)
    db.commit()
    db.refresh(pedido)
    return pedido
