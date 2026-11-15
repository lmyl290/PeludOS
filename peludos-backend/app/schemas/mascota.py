from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class MascotaBase(BaseModel):
    """Campos comunes compartidos entre creación y lectura."""
    nombre: str
    especie: str
    raza: Optional[str] = None
    sexo: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    peso_kg: Optional[Decimal] = None
    color_mascota: Optional[str] = None
    numero_chip: Optional[str] = None
    foto_url: Optional[str] = None
    alergias: Optional[str] = None
    condiciones_medicas: Optional[str] = None


class MascotaCreate(MascotaBase):
    """Lo que se recibe al registrar una mascota (id_usuario se toma del token, no del body)."""
    pass


class MascotaUpdate(BaseModel):
    """Campos que el dueño puede actualizar de su mascota. Todos opcionales."""
    nombre: Optional[str] = None
    especie: Optional[str] = None
    raza: Optional[str] = None
    sexo: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    peso_kg: Optional[Decimal] = None
    color_mascota: Optional[str] = None
    numero_chip: Optional[str] = None
    foto_url: Optional[str] = None
    alergias: Optional[str] = None
    condiciones_medicas: Optional[str] = None


class MascotaResponse(MascotaBase):
    """Lo que se devuelve al cliente."""
    model_config = ConfigDict(from_attributes=True)

    id_mascota: int
    id_usuario: int
    activo: bool
