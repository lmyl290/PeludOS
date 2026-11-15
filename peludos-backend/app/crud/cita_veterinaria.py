from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.cita_veterinaria import CitaVeterinaria
from app.models.mascota import Mascota
from app.schemas.cita_veterinaria import CitaVeterinariaCreate


def get_cita_by_id(db: Session, id_cita: int) -> Optional[CitaVeterinaria]:
    """Busca una cita por su ID."""
    return db.query(CitaVeterinaria).filter(CitaVeterinaria.id_cita == id_cita).first()


def get_citas(db: Session) -> List[CitaVeterinaria]:
    """Lista todas las citas (uso exclusivo de admin)."""
    return db.query(CitaVeterinaria).all()


def get_citas_by_mascotas(db: Session, ids_mascotas: List[int]) -> List[CitaVeterinaria]:
    """Lista las citas de un conjunto de mascotas (usado para el rol cliente)."""
    if not ids_mascotas:
        return []
    return db.query(CitaVeterinaria).filter(CitaVeterinaria.id_mascota.in_(ids_mascotas)).all()


def get_citas_by_profesional(db: Session, id_profesional: int) -> List[CitaVeterinaria]:
    """Lista las citas asignadas a un profesional."""
    return db.query(CitaVeterinaria).filter(CitaVeterinaria.id_profesional == id_profesional).all()


def existe_cita_entre_cliente_y_profesional(db: Session, id_usuario_cliente: int, id_profesional: int) -> bool:
    """Indica si el cliente ya tuvo alguna cita (en cualquier estado) con ese profesional."""
    return (
        db.query(CitaVeterinaria)
        .join(Mascota, CitaVeterinaria.id_mascota == Mascota.id_mascota)
        .filter(Mascota.id_usuario == id_usuario_cliente, CitaVeterinaria.id_profesional == id_profesional)
        .first()
        is not None
    )


def get_cita_conflicto(
    db: Session,
    id_profesional: int,
    fecha_cita,
    excluir_id_cita: Optional[int] = None,
) -> Optional[CitaVeterinaria]:
    """Busca si el profesional ya tiene otra cita activa (no cancelada) en esa fecha/hora exacta."""
    query = db.query(CitaVeterinaria).filter(
        CitaVeterinaria.id_profesional == id_profesional,
        CitaVeterinaria.fecha_cita == fecha_cita,
        CitaVeterinaria.estado != "cancelada",
    )
    if excluir_id_cita is not None:
        query = query.filter(CitaVeterinaria.id_cita != excluir_id_cita)
    return query.first()


def create_cita(db: Session, cita_data: CitaVeterinariaCreate) -> CitaVeterinaria:
    """Agenda una nueva cita veterinaria."""
    nueva_cita = CitaVeterinaria(**cita_data.model_dump())
    db.add(nueva_cita)
    db.commit()
    db.refresh(nueva_cita)
    return nueva_cita


def update_cita(db: Session, cita: CitaVeterinaria, datos: dict) -> CitaVeterinaria:
    """Actualiza los campos ya validados/filtrados por el router según el rol del solicitante."""
    for campo, valor in datos.items():
        setattr(cita, campo, valor)
    db.commit()
    db.refresh(cita)
    return cita
