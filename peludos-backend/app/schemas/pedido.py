from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Literal

from pydantic import BaseModel, ConfigDict

EstadoPedido = Literal["pendiente", "confirmado", "en_preparacion", "enviado", "entregado", "cancelado"]
MetodoPago = Literal["efectivo", "tarjeta", "transferencia"]


class PedidoCreate(BaseModel):
    """Lo que recibe el cliente al hacer checkout de su carrito activo."""
    direccion_entrega: str
    metodo_pago: Optional[MetodoPago] = None
    notas: Optional[str] = None


class PedidoUpdate(BaseModel):
    """
    Campos editables de un pedido. Todos opcionales.
    El router restringe qué campos puede tocar cada rol (ver update_pedido_existente).
    """
    estado_pedido: Optional[EstadoPedido] = None
    fecha_entrega: Optional[datetime] = None
    notas: Optional[str] = None


class DetallePedidoResponse(BaseModel):
    """Una línea del pedido (snapshot inmutable)."""
    model_config = ConfigDict(from_attributes=True)

    id_detalle_pedido: int
    id_producto: int
    nombre_producto: str
    cantidad: int
    precio_unitario: Decimal
    subtotal: Decimal


class PedidoResponse(BaseModel):
    """Lo que se devuelve al cliente."""
    model_config = ConfigDict(from_attributes=True)

    id_pedido: int
    id_usuario: int
    id_veterinaria: int
    id_carrito: int
    fecha_pedido: datetime
    total: Decimal
    estado_pedido: str
    metodo_pago: Optional[str] = None
    direccion_entrega: str
    notas: Optional[str] = None
    fecha_entrega: Optional[datetime] = None
    detalles: List[DetallePedidoResponse] = []
