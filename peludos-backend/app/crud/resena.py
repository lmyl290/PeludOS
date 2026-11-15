from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.resena import Resena
from app.schemas.resena import ResenaCreate, ResenaUpdate


def get_resena_by_id(db: Session, id_resena: int) -> Optional[Resena]:
    """Busca una reseña por su ID."""
    return db.query(Resena).filter(Resena.id_resena == id_resena).first()


def get_resena_activa_por_pedido(db: Session, id_pedido: int) -> Optional[Resena]:
    """Busca si ya existe una reseña activa para ese pedido (una reseña por compra verificada)."""
    return (
        db.query(Resena)
        .filter(Resena.id_pedido == id_pedido, Resena.activo.is_(True))
        .first()
    )


def get_resenas_by_veterinaria(db: Session, id_veterinaria: int) -> List[Resena]:
    """Lista las reseñas de una veterinaria."""
    return db.query(Resena).filter(Resena.id_veterinaria == id_veterinaria).all()


def get_calificaciones_activas(db: Session, id_veterinaria: int) -> List[int]:
    """Devuelve las calificaciones de las reseñas activas de una veterinaria, para recalcular el promedio."""
    filas = (
        db.query(Resena.calificacion)
        .filter(Resena.id_veterinaria == id_veterinaria, Resena.activo.is_(True))
        .all()
    )
    return [fila[0] for fila in filas]


def create_resena(db: Session, resena_data: ResenaCreate, id_usuario: int) -> Resena:
    """Registra una nueva reseña de un usuario para una veterinaria."""
    nueva_resena = Resena(**resena_data.model_dump(), id_usuario=id_usuario)
    db.add(nueva_resena)
    db.commit()
    db.refresh(nueva_resena)
    return nueva_resena


def update_resena(db: Session, resena: Resena, resena_data: ResenaUpdate) -> Resena:
    """Actualiza solo los campos que vienen con valor (actualización parcial)."""
    datos = resena_data.model_dump(exclude_unset=True)
    for campo, valor in datos.items():
        setattr(resena, campo, valor)
    db.commit()
    db.refresh(resena)
    return resena


def desactivar_resena(db: Session, resena: Resena) -> Resena:
    """Soft delete: marca la reseña como inactiva en vez de borrarla físicamente."""
    resena.activo = False
    db.commit()
    db.refresh(resena)
    return resena
