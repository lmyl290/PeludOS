from datetime import datetime
from typing import Optional, Literal

from pydantic import BaseModel, ConfigDict

TipoRecordatorio = Literal["vacuna", "medicamento", "cita", "otro"]


class RecordatorioBase(BaseModel):
    """Campos comunes compartidos entre creación y lectura."""
    titulo: str
    descripcion: Optional[str] = None
    tipo: TipoRecordatorio
    fecha_programada: datetime
    frecuencia: Optional[str] = None


class RecordatorioCreate(RecordatorioBase):
    """Lo que recibe el dueño de la mascota (o un admin) al crear un recordatorio."""
    id_mascota: int


class RecordatorioUpdate(BaseModel):
    """Campos editables de un recordatorio. Todos opcionales."""
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    tipo: Optional[TipoRecordatorio] = None
    fecha_programada: Optional[datetime] = None
    frecuencia: Optional[str] = None
    notificado: Optional[bool] = None
    fecha_notificacion: Optional[datetime] = None


class RecordatorioResponse(RecordatorioBase):
    """Lo que se devuelve al cliente."""
    model_config = ConfigDict(from_attributes=True)

    id_recordatorio: int
    id_mascota: int
    notificado: bool
    fecha_notificacion: Optional[datetime] = None
    activo: bool
    fecha_creacion: datetime
