from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.profesional import Profesional
from app.schemas.profesional import ProfesionalCreate, ProfesionalUpdate


def get_profesional_by_id(db: Session, id_profesional: int) -> Optional[Profesional]:
    """Busca un profesional por su ID."""
    return db.query(Profesional).filter(Profesional.id_profesional == id_profesional).first()


def get_profesional_by_usuario(db: Session, id_usuario: int) -> Optional[Profesional]:
    """Busca el perfil profesional vinculado a una cuenta de usuario."""
    return db.query(Profesional).filter(Profesional.id_usuario == id_usuario).first()


def get_profesionales(db: Session, id_veterinaria: Optional[int] = None) -> List[Profesional]:
    """Lista profesionales, opcionalmente filtrados por veterinaria."""
    query = db.query(Profesional)
    if id_veterinaria is not None:
        query = query.filter(Profesional.id_veterinaria == id_veterinaria)
    return query.all()


def create_profesional(db: Session, profesional_data: ProfesionalCreate) -> Profesional:
    """Vincula un usuario a una veterinaria como profesional."""
    nuevo_profesional = Profesional(**profesional_data.model_dump())
    db.add(nuevo_profesional)
    db.commit()
    db.refresh(nuevo_profesional)
    return nuevo_profesional


def update_profesional(db: Session, profesional: Profesional, profesional_data: ProfesionalUpdate) -> Profesional:
    """Actualiza solo los campos que vienen con valor (actualización parcial)."""
    datos = profesional_data.model_dump(exclude_unset=True)
    for campo, valor in datos.items():
        setattr(profesional, campo, valor)
    db.commit()
    db.refresh(profesional)
    return profesional


def desactivar_profesional(db: Session, profesional: Profesional) -> Profesional:
    """Soft delete: marca el profesional como inactivo en vez de borrarlo físicamente."""
    profesional.activo = False
    db.commit()
    db.refresh(profesional)
    return profesional
