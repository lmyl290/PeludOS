from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class MensajeCreate(BaseModel):
    """Lo que recibe el usuario autenticado (remitente) al enviar un mensaje."""
    id_usuario_destinatario: int
    id_veterinaria: Optional[int] = None
    id_cita: Optional[int] = None
    contenido: str = Field(min_length=1)


class MensajeUpdate(BaseModel):
    """Solo permite marcar el mensaje como leído; no se puede revertir a no leído."""
    leido: bool


class MensajeResponse(BaseModel):
    """Lo que se devuelve al cliente."""
    model_config = ConfigDict(from_attributes=True)

    id_mensaje: int
    id_usuario_remitente: int
    id_usuario_destinatario: int
    id_veterinaria: Optional[int] = None
    id_cita: Optional[int] = None
    contenido: str
    leido: bool
    fecha_envio: datetime
