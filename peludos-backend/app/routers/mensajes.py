from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.mensaje import MensajeCreate, MensajeUpdate, MensajeResponse
from app.crud.mensaje import (
    get_mensaje_by_id,
    get_mensajes,
    create_mensaje,
    marcar_como_leido,
    eliminar_mensaje,
)
from app.crud.usuario import get_usuario_by_id
from app.crud.veterinaria import get_veterinaria_by_id
from app.crud.profesional import get_profesional_by_usuario, get_profesional_by_id
from app.crud.cita_veterinaria import get_cita_by_id, existe_cita_entre_cliente_y_profesional
from app.crud.mascota import get_mascota_by_id
from app.crud.pedido import existe_pedido_entre_cliente_y_veterinaria
from app.core.security import get_current_user, get_current_admin

router = APIRouter(prefix="/mensajes", tags=["Mensajes"])


def _existe_relacion_previa(db: Session, usuario_a: Usuario, usuario_b: Usuario) -> bool:
    """Determina si hay una cita o un pedido previo entre un cliente y un profesional."""
    if usuario_a.rol == "profesional":
        profesional_usuario, cliente_usuario = usuario_a, usuario_b
    elif usuario_b.rol == "profesional":
        profesional_usuario, cliente_usuario = usuario_b, usuario_a
    else:
        return False

    profesional = get_profesional_by_usuario(db, profesional_usuario.id_usuario)
    if not profesional:
        return False

    if existe_cita_entre_cliente_y_profesional(db, cliente_usuario.id_usuario, profesional.id_profesional):
        return True
    return existe_pedido_entre_cliente_y_veterinaria(db, cliente_usuario.id_usuario, profesional.id_veterinaria)


def _validar_id_veterinaria(db: Session, id_veterinaria: int, remitente: Usuario, destinatario: Usuario) -> None:
    """Exige que al menos uno de los dos usuarios sea un profesional vinculado a esa veterinaria."""
    profesional_remitente = get_profesional_by_usuario(db, remitente.id_usuario)
    profesional_destinatario = get_profesional_by_usuario(db, destinatario.id_usuario)
    vinculado = (profesional_remitente is not None and profesional_remitente.id_veterinaria == id_veterinaria) or (
        profesional_destinatario is not None and profesional_destinatario.id_veterinaria == id_veterinaria
    )
    if not vinculado:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ninguno de los dos usuarios pertenece a esa veterinaria",
        )


def _validar_id_cita(db: Session, id_cita: int, remitente: Usuario, destinatario: Usuario) -> None:
    """Exige que remitente y destinatario sean el dueño de la mascota y el profesional asignado de esa cita."""
    cita = get_cita_by_id(db, id_cita)
    if not cita:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La cita indicada no existe")

    mascota = get_mascota_by_id(db, cita.id_mascota)
    profesional = get_profesional_by_id(db, cita.id_profesional)
    if not mascota or not profesional:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La cita indicada tiene datos inconsistentes")

    ids_validos = {mascota.id_usuario, profesional.id_usuario}
    if remitente.id_usuario not in ids_validos or destinatario.id_usuario not in ids_validos:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El remitente y el destinatario deben ser el dueño de la mascota y el profesional de esa cita",
        )


@router.post("", response_model=MensajeResponse, status_code=status.HTTP_201_CREATED)
def create_mensaje_nuevo(
    mensaje_data: MensajeCreate,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Envía un mensaje. Requiere una relación previa (cita o pedido) salvo que el remitente sea admin."""
    if mensaje_data.id_usuario_destinatario == usuario_actual.id_usuario:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No puedes enviarte un mensaje a ti mismo")

    destinatario = get_usuario_by_id(db, mensaje_data.id_usuario_destinatario)
    if not destinatario or not destinatario.activo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El destinatario indicado no existe")

    if mensaje_data.id_veterinaria is not None:
        if not get_veterinaria_by_id(db, mensaje_data.id_veterinaria):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La veterinaria indicada no existe")
        _validar_id_veterinaria(db, mensaje_data.id_veterinaria, usuario_actual, destinatario)

    if mensaje_data.id_cita is not None:
        _validar_id_cita(db, mensaje_data.id_cita, usuario_actual, destinatario)

    if usuario_actual.rol != "admin" and not _existe_relacion_previa(db, usuario_actual, destinatario):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes escribir a usuarios con quienes tengas una cita o un pedido previo",
        )

    return create_mensaje(db, mensaje_data, usuario_actual.id_usuario)


@router.get("", response_model=List[MensajeResponse])
def list_mensajes(
    con_usuario: Optional[int] = None,
    id_cita: Optional[int] = None,
    id_veterinaria: Optional[int] = None,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lista mensajes propios (enviados o recibidos). El admin ve todos, para auditoría/moderación."""
    id_usuario = None if usuario_actual.rol == "admin" else usuario_actual.id_usuario
    return get_mensajes(db, id_usuario=id_usuario, con_usuario=con_usuario, id_cita=id_cita, id_veterinaria=id_veterinaria)


@router.get("/{id_mensaje}", response_model=MensajeResponse)
def read_mensaje(
    id_mensaje: int,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Devuelve el detalle de un mensaje (remitente, destinatario, o admin)."""
    mensaje = get_mensaje_by_id(db, id_mensaje)
    if not mensaje:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mensaje no encontrado")

    es_participante = usuario_actual.id_usuario in (mensaje.id_usuario_remitente, mensaje.id_usuario_destinatario)
    if not (es_participante or usuario_actual.rol == "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes acceso a este mensaje")

    return mensaje


@router.patch("/{id_mensaje}", response_model=MensajeResponse)
def update_mensaje_existente(
    id_mensaje: int,
    mensaje_data: MensajeUpdate,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Marca el mensaje como leído. Solo el destinatario puede hacerlo, y no se puede revertir."""
    mensaje = get_mensaje_by_id(db, id_mensaje)
    if not mensaje:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mensaje no encontrado")

    if mensaje.id_usuario_destinatario != usuario_actual.id_usuario:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo el destinatario puede marcar el mensaje como leído")

    if not mensaje_data.leido:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No se puede revertir un mensaje a no leído")

    return marcar_como_leido(db, mensaje)


@router.delete("/{id_mensaje}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mensaje_existente(
    id_mensaje: int,
    usuario_admin: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Elimina físicamente un mensaje. Solo administradores (moderación de contenido inapropiado)."""
    mensaje = get_mensaje_by_id(db, id_mensaje)
    if not mensaje:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mensaje no encontrado")
    eliminar_mensaje(db, mensaje)
