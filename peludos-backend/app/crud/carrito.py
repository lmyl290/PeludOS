from decimal import Decimal
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.carrito_compra import CarritoCompra
from app.models.detalle_carrito import DetalleCarrito


def get_carrito_activo(db: Session, id_usuario: int) -> Optional[CarritoCompra]:
    """Busca el carrito en estado 'activo' del usuario, si existe."""
    return (
        db.query(CarritoCompra)
        .filter(CarritoCompra.id_usuario == id_usuario, CarritoCompra.estado == "activo")
        .first()
    )


def crear_carrito(db: Session, id_usuario: int) -> CarritoCompra:
    """Crea un carrito nuevo en estado 'activo' para el usuario."""
    nuevo_carrito = CarritoCompra(id_usuario=id_usuario)
    db.add(nuevo_carrito)
    db.commit()
    db.refresh(nuevo_carrito)
    return nuevo_carrito


def obtener_o_crear_carrito_activo(db: Session, id_usuario: int) -> CarritoCompra:
    """Devuelve el carrito activo del usuario, creando uno nuevo si no existe."""
    carrito = get_carrito_activo(db, id_usuario)
    if carrito:
        return carrito
    return crear_carrito(db, id_usuario)


def get_items_carrito(db: Session, id_carrito: int) -> List[DetalleCarrito]:
    """Lista las líneas de un carrito."""
    return db.query(DetalleCarrito).filter(DetalleCarrito.id_carrito == id_carrito).all()


def get_item_carrito_by_id(db: Session, id_detalle_carrito: int) -> Optional[DetalleCarrito]:
    """Busca una línea de carrito por su ID."""
    return db.query(DetalleCarrito).filter(DetalleCarrito.id_detalle_carrito == id_detalle_carrito).first()


def get_item_por_producto(db: Session, id_carrito: int, id_producto: int) -> Optional[DetalleCarrito]:
    """Busca si el producto ya está en el carrito, para acumular cantidad en vez de duplicar la línea."""
    return (
        db.query(DetalleCarrito)
        .filter(DetalleCarrito.id_carrito == id_carrito, DetalleCarrito.id_producto == id_producto)
        .first()
    )


def agregar_item_carrito(
    db: Session,
    id_carrito: int,
    id_producto: int,
    cantidad: int,
    precio_unitario: Decimal,
) -> DetalleCarrito:
    """Crea una nueva línea en el carrito. El precio se congela (snapshot) al momento de agregar."""
    nuevo_item = DetalleCarrito(
        id_carrito=id_carrito,
        id_producto=id_producto,
        cantidad=cantidad,
        precio_unitario=precio_unitario,
        subtotal=precio_unitario * cantidad,
    )
    db.add(nuevo_item)
    db.commit()
    db.refresh(nuevo_item)
    return nuevo_item


def actualizar_cantidad_item(db: Session, item: DetalleCarrito, cantidad: int) -> DetalleCarrito:
    """Actualiza la cantidad y recalcula el subtotal (el precio_unitario congelado no cambia)."""
    item.cantidad = cantidad
    item.subtotal = item.precio_unitario * cantidad
    db.commit()
    db.refresh(item)
    return item


def eliminar_item_carrito(db: Session, item: DetalleCarrito) -> None:
    """Quita una línea del carrito."""
    db.delete(item)
    db.commit()


def marcar_carrito_completado(db: Session, carrito: CarritoCompra) -> CarritoCompra:
    """Cierra el carrito tras el checkout; el próximo ítem agregado creará uno nuevo."""
    carrito.estado = "completado"
    db.commit()
    db.refresh(carrito)
    return carrito
