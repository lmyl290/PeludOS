from datetime import datetime, timezone
from typing import Optional, Literal

from pydantic import BaseModel, ConfigDict, field_validator

EstadoCita = Literal["programada", "confirmada", "cancelada", "completada", "no_asistio"]


def _validar_fecha_futura(valor: Optional[datetime]) -> Optional[datetime]:
    """Rechaza fechas en el pasado, comparando en UTC sin importar si el valor trae tzinfo."""
    if valor is None:
        return valor
    ahora = datetime.now(timezone.utc)
    valor_utc = valor if valor.tzinfo else valor.replace(tzinfo=timezone.utc)
    if valor_utc < ahora:
        raise ValueError("fecha_cita no puede ser una fecha en el pasado")
    return valor


class CitaVeterinariaBase(BaseModel):
    """Campos comunes compartidos entre creación y lectura."""
    fecha_cita: datetime
    motivo: str

    @field_validator("fecha_cita")
    @classmethod
    def _fecha_cita_no_pasado(cls, valor: datetime) -> datetime:
        return _validar_fecha_futura(valor)


class CitaVeterinariaCreate(CitaVeterinariaBase):
    """Lo que recibe el cliente (dueño de la mascota) o un admin al agendar una cita."""
    id_mascota: int
    id_profesional: int
    id_veterinaria: int


class CitaVeterinariaUpdate(BaseModel):
    """
    Campos editables de una cita. Todos opcionales.
    El router restringe qué campos puede tocar cada rol (ver _validar_permisos_actualizacion).
    """
    fecha_cita: Optional[datetime] = None
    motivo: Optional[str] = None
    estado: Optional[EstadoCita] = None
    notas: Optional[str] = None

    @field_validator("fecha_cita")
    @classmethod
    def _fecha_cita_no_pasado(cls, valor: Optional[datetime]) -> Optional[datetime]:
        return _validar_fecha_futura(valor)


class CitaVeterinariaResponse(CitaVeterinariaBase):
    """Lo que se devuelve al cliente."""
    model_config = ConfigDict(from_attributes=True)

    id_cita: int
    id_mascota: int
    id_profesional: int
    id_veterinaria: int
    estado: str
    notas: Optional[str] = None
    fecha_creacion: datetime