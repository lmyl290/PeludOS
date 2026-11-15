from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProductoBase(BaseModel):
    """Campos comunes compartidos entre creación y lectura."""
    nombre_producto: str
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    precio_compra: Decimal
    precio_venta: Decimal
    stock: int = 0
    unidad_medida: Optional[str] = None
    imagen_url: Optional[str] = None


class ProductoCreate(ProductoBase):
    """Lo que recibe el profesional (o un admin) al registrar un producto."""
    id_veterinaria: int


class ProductoUpdate(BaseModel):
    """Campos editables de un producto. Todos opcionales."""
    nombre_producto: Optional[str] = None
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    precio_compra: Optional[Decimal] = None
    precio_venta: Optional[Decimal] = None
    stock: Optional[int] = None
    unidad_medida: Optional[str] = None
    imagen_url: Optional[str] = None


class ProductoResponse(ProductoBase):
    """Lo que se devuelve al cliente."""
    model_config = ConfigDict(from_attributes=True)

    id_producto: int
    id_veterinaria: int
    activo: bool
    fecha_creacion: datetime
