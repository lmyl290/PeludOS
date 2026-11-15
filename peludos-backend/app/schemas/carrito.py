from datetime import datetime
from decimal import Decimal
from typing import List

from pydantic import BaseModel, ConfigDict, field_validator


class ItemCarritoCreate(BaseModel):
    """Lo que recibe el cliente al agregar un producto al carrito."""
    id_producto: int
    cantidad: int = 1

    @field_validator("cantidad")
    @classmethod
    def _cantidad_minima(cls, valor: int) -> int:
        if valor < 1:
            raise ValueError("cantidad debe ser al menos 1")
        return valor


class ItemCarritoUpdate(BaseModel):
    """Actualización de cantidad de un ítem existente en el carrito."""
    cantidad: int

    @field_validator("cantidad")
    @classmethod
    def _cantidad_minima(cls, valor: int) -> int:
        if valor < 1:
            raise ValueError("cantidad debe ser al menos 1")
        return valor


class DetalleCarritoResponse(BaseModel):
    """Una línea del carrito."""
    model_config = ConfigDict(from_attributes=True)

    id_detalle_carrito: int
    id_carrito: int
    id_producto: int
    cantidad: int
    precio_unitario: Decimal
    subtotal: Decimal


class CarritoResponse(BaseModel):
    """El carrito activo del usuario con sus líneas."""
    model_config = ConfigDict(from_attributes=True)

    id_carrito: int
    id_usuario: int
    estado: str
    fecha_creacion: datetime
    items: List[DetalleCarritoResponse] = []
