from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.producto import Producto
from app.schemas.producto import ProductoCreate, ProductoUpdate


def get_producto_by_id(db: Session, id_producto: int) -> Optional[Producto]:
    """Busca un producto por su ID."""
    return db.query(Producto).filter(Producto.id_producto == id_producto).first()


def get_productos(
    db: Session,
    id_veterinaria: Optional[int] = None,
    categoria: Optional[str] = None,
) -> List[Producto]:
    """Lista productos, opcionalmente filtrados por veterinaria y/o categoría."""
    query = db.query(Producto)
    if id_veterinaria is not None:
        query = query.filter(Producto.id_veterinaria == id_veterinaria)
    if categoria is not None:
        query = query.filter(Producto.categoria == categoria)
    return query.all()


def create_producto(db: Session, producto_data: ProductoCreate) -> Producto:
    """Registra un nuevo producto para una veterinaria."""
    nuevo_producto = Producto(**producto_data.model_dump())
    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)
    return nuevo_producto


def update_producto(db: Session, producto: Producto, producto_data: ProductoUpdate) -> Producto:
    """Actualiza solo los campos que vienen con valor (actualización parcial)."""
    datos = producto_data.model_dump(exclude_unset=True)
    for campo, valor in datos.items():
        setattr(producto, campo, valor)
    db.commit()
    db.refresh(producto)
    return producto


def desactivar_producto(db: Session, producto: Producto) -> Producto:
    """Soft delete: marca el producto como inactivo en vez de borrarlo físicamente."""
    producto.activo = False
    db.commit()
    db.refresh(producto)
    return producto
