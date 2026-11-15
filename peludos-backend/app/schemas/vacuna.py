from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class VacunaBase(BaseModel):
    """Campos comunes compartidos entre creación y lectura."""
    nombre_vacuna: str
    fecha_aplicacion: date
    fecha_proxima_dosis: Optional[date] = None
    numero_dosis: int = 1
    lote: Optional[str] = None
    veterinario_nombre: Optional[str] = None


class VacunaCreate(VacunaBase):
    """Lo que recibe el dueño de la mascota (o un admin) al registrar una vacuna."""
    id_mascota: int
    id_recordatorio: Optional[int] = None


class VacunaUpdate(BaseModel):
    """Campos editables de una vacuna. Todos opcionales."""
    nombre_vacuna: Optional[str] = None
    fecha_aplicacion: Optional[date] = None
    fecha_proxima_dosis: Optional[date] = None
    numero_dosis: Optional[int] = None
    lote: Optional[str] = None
    veterinario_nombre: Optional[str] = None
    id_recordatorio: Optional[int] = None


class VacunaResponse(VacunaBase):
    """Lo que se devuelve al cliente."""
    model_config = ConfigDict(from_attributes=True)

    id_vacuna: int
    id_mascota: int
    id_recordatorio: Optional[int] = None
    fecha_creacion: datetime
