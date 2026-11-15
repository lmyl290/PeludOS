from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class ProfesionalBase(BaseModel):
    """Campos comunes compartidos entre creación y lectura."""
    nombre_completo: str
    especialidad: Optional[str] = None
    numero_registro_profesional: Optional[str] = None
    telefono: Optional[str] = None
    correo_electronico: Optional[EmailStr] = None


class ProfesionalCreate(ProfesionalBase):
    """Lo que recibe un admin al vincular un usuario (rol='profesional') a una veterinaria."""
    id_usuario: int
    id_veterinaria: int


class ProfesionalUpdate(BaseModel):
    """Campos editables por el admin o por el propio profesional. Todos opcionales."""
    nombre_completo: Optional[str] = None
    especialidad: Optional[str] = None
    numero_registro_profesional: Optional[str] = None
    telefono: Optional[str] = None
    correo_electronico: Optional[EmailStr] = None


class ProfesionalResponse(ProfesionalBase):
    """Lo que se devuelve al cliente."""
    model_config = ConfigDict(from_attributes=True)

    id_profesional: int
    id_usuario: int
    id_veterinaria: int
    activo: bool
