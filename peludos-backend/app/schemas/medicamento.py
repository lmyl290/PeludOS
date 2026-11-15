from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict


class MedicamentoBase(BaseModel):
    """Campos comunes compartidos entre creación y lectura."""
    nombre_medicamento: str
    dosis: Optional[str] = None
    unidad_medida: Optional[str] = None
    frecuencia_administracion: Optional[str] = None
    fecha_inicio: date
    fecha_fin: Optional[date] = None
    observaciones: Optional[str] = None


class MedicamentoCreate(MedicamentoBase):
    """Lo que recibe el dueño de la mascota (o un admin) al registrar un medicamento."""
    id_mascota: int
    id_recordatorio: Optional[int] = None


class MedicamentoUpdate(BaseModel):
    """Campos editables de un medicamento. Todos opcionales."""
    nombre_medicamento: Optional[str] = None
    dosis: Optional[str] = None
    unidad_medida: Optional[str] = None
    frecuencia_administracion: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    observaciones: Optional[str] = None
    id_recordatorio: Optional[int] = None


class MedicamentoResponse(MedicamentoBase):
    """Lo que se devuelve al cliente."""
    model_config = ConfigDict(from_attributes=True)

    id_medicamento: int
    id_mascota: int
    id_recordatorio: Optional[int] = None
    activo: bool
