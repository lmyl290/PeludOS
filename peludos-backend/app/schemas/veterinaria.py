from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class VeterinariaBase(BaseModel):
    """Campos comunes compartidos entre creación y lectura."""
    nombre_comercial: str
    direccion: str
    telefono: str
    correo_electronico: Optional[EmailStr] = None
    horario_atencion: Optional[str] = None
    latitud: Optional[Decimal] = None
    longitud: Optional[Decimal] = None


class VeterinariaCreate(VeterinariaBase):
    """Lo que recibe un admin al registrar una veterinaria."""
    pass


class VeterinariaUpdate(BaseModel):
    """Campos que un admin puede actualizar. Todos opcionales."""
    nombre_comercial: Optional[str] = None
    direccion: Optional[str] = None
    telefono: Optional[str] = None
    correo_electronico: Optional[EmailStr] = None
    horario_atencion: Optional[str] = None
    latitud: Optional[Decimal] = None
    longitud: Optional[Decimal] = None


class VeterinariaResponse(VeterinariaBase):
    """Lo que se devuelve al cliente."""
    model_config = ConfigDict(from_attributes=True)

    id_veterinaria: int
    calificacion_promedio: Decimal
    activo: bool
