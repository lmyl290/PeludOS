from typing import List, Optional

from sqlalchemy import or_, and_
from sqlalchemy.orm import Session

from app.models.mensaje import Mensaje
from app.schemas.mensaje import MensajeCreate


def get_mensaje_by_id(db: Session, id_mensaje: int) -> Optional[Mensaje]:
    """Busca un mensaje por su ID."""
    return db.query(Mensaje).filter(Mensaje.id_mensaje == id_mensaje).first()


def get_mensajes(
    db: Session,
    id_usuario: Optional[int] = None,
    con_usuario: Optional[int] = None,
    id_cita: Optional[int] = None,
    id_veterinaria: Optional[int] = None,
) -> List[Mensaje]:
    """
    Lista mensajes con filtros opcionales, ordenados por fecha de envío.
    Si id_usuario se indica, solo devuelve mensajes donde participe ese usuario (remitente o destinatario).
    Si además con_usuario se indica, filtra la conversación exacta entre ambos.
    Si solo con_usuario se indica (sin id_usuario, uso exclusivo de admin), filtra mensajes donde participe con_usuario.
    """
    query = db.query(Mensaje)

    if id_usuario is not None:
        if con_usuario is not None:
            query = query.filter(
                or_(
                    and_(Mensaje.id_usuario_remitente == id_usuario, Mensaje.id_usuario_destinatario == con_usuario),
                    and_(Mensaje.id_usuario_remitente == con_usuario, Mensaje.id_usuario_destinatario == id_usuario),
                )
            )
        else:
            query = query.filter(
                or_(Mensaje.id_usuario_remitente == id_usuario, Mensaje.id_usuario_destinatario == id_usuario)
            )
    elif con_usuario is not None:
        query = query.filter(
            or_(Mensaje.id_usuario_remitente == con_usuario, Mensaje.id_usuario_destinatario == con_usuario)
        )

    if id_cita is not None:
        query = query.filter(Mensaje.id_cita == id_cita)
    if id_veterinaria is not None:
        query = query.filter(Mensaje.id_veterinaria == id_veterinaria)

    return query.order_by(Mensaje.fecha_envio).all()


def create_mensaje(db: Session, mensaje_data: MensajeCreate, id_usuario_remitente: int) -> Mensaje:
    """Crea un nuevo mensaje enviado por el usuario autenticado."""
    nuevo_mensaje = Mensaje(**mensaje_data.model_dump(), id_usuario_remitente=id_usuario_remitente)
    db.add(nuevo_mensaje)
    db.commit()
    db.refresh(nuevo_mensaje)
    return nuevo_mensaje


def marcar_como_leido(db: Session, mensaje: Mensaje) -> Mensaje:
    """Marca el mensaje como leído. No hay operación inversa (no se puede des-marcar)."""
    mensaje.leido = True
    db.commit()
    db.refresh(mensaje)
    return mensaje


def eliminar_mensaje(db: Session, mensaje: Mensaje) -> None:
    """Hard delete: la tabla mensajes no tiene columna 'activo' en el modelo original."""
    db.delete(mensaje)
    db.commit()
