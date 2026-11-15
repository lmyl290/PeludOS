from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.mascota import Mascota
from app.schemas.mascota import MascotaCreate, MascotaUpdate


def get_mascota_by_id(db: Session, id_mascota: int) -> Optional[Mascota]:
    """Busca una mascota por su ID."""
    return db.query(Mascota).filter(Mascota.id_mascota == id_mascota).first()


def get_mascotas_by_usuario(db: Session, id_usuario: int) -> List[Mascota]:
    """Lista todas las mascotas registradas por un usuario."""
    return db.query(Mascota).filter(Mascota.id_usuario == id_usuario).all()


def create_mascota(db: Session, mascota_data: MascotaCreate, id_usuario: int) -> Mascota:
    """Crea una nueva mascota asociada al usuario autenticado."""
    nueva_mascota = Mascota(**mascota_data.model_dump(), id_usuario=id_usuario)
    db.add(nueva_mascota)
    db.commit()
    db.refresh(nueva_mascota)
    return nueva_mascota


def update_mascota(db: Session, mascota: Mascota, mascota_data: MascotaUpdate) -> Mascota:
    """Actualiza solo los campos que vienen con valor (actualización parcial)."""
    datos = mascota_data.model_dump(exclude_unset=True)
    for campo, valor in datos.items():
        setattr(mascota, campo, valor)
    db.commit()
    db.refresh(mascota)
    return mascota


def desactivar_mascota(db: Session, mascota: Mascota) -> Mascota:
    """Soft delete: marca la mascota como inactiva en vez de borrarla físicamente."""
    mascota.activo = False
    db.commit()
    db.refresh(mascota)
    return mascota
