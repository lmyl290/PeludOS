from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ResenaBase(BaseModel):
    """Campos comunes compartidos entre creación y lectura."""
    calificacion: int = Field(ge=1, le=5)
    comentario: Optional[str] = None


class ResenaCreate(ResenaBase):
    """Lo que recibe el cliente al reseñar una veterinaria; exige un pedido propio y entregado."""
    id_veterinaria: int
    id_pedido: int


class ResenaUpdate(BaseModel):
    """Campos editables de una reseña. Todos opcionales."""
    calificacion: Optional[int] = Field(default=None, ge=1, le=5)
    comentario: Optional[str] = None


class ResenaResponse(ResenaBase):
    """Lo que se devuelve al cliente."""
    model_config = ConfigDict(from_attributes=True)

    id_resena: int
    id_usuario: int
    id_veterinaria: int
    id_pedido: Optional[int] = None
    activo: bool
    fecha_creacion: datetime
