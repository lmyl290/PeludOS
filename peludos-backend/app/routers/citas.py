from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.cita_veterinaria import (
    CitaVeterinariaCreate,
    CitaVeterinariaUpdate,
    CitaVeterinariaResponse,
)
from app.crud.cita_veterinaria import (
    get_cita_by_id,
    get_citas,
    get_citas_by_mascotas,
    get_citas_by_profesional,
    get_cita_conflicto,
    create_cita,
    update_cita,
)
from app.crud.mascota import get_mascota_by_id, get_mascotas_by_usuario
from app.crud.profesional import get_profesional_by_id, get_profesional_by_usuario
from app.core.security import get_current_user

router = APIRouter(prefix="/citas", tags=["Citas Veterinarias"])

# Campos que un cliente (dueño de la mascota) puede modificar de su propia cita.
_CAMPOS_PERMITIDOS_CLIENTE = {"fecha_cita", "estado"}


@router.post("", response_model=CitaVeterinariaResponse, status_code=status.HTTP_201_CREATED)
def create_cita_nueva(
    cita_data: CitaVeterinariaCreate,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Agenda una cita para una mascota propia (o cualquiera, si es admin)."""
    mascota = get_mascota_by_id(db, cita_data.id_mascota)
    if not mascota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La mascota indicada no existe")
    if mascota.id_usuario != usuario_actual.id_usuario and usuario_actual.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes agendar citas para tus propias mascotas",
        )

    profesional = get_profesional_by_id(db, cita_data.id_profesional)
    if not profesional:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El profesional indicado no existe")
    if profesional.id_veterinaria != cita_data.id_veterinaria:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El profesional indicado no pertenece a la veterinaria indicada",
        )

    if get_cita_conflicto(db, cita_data.id_profesional, cita_data.fecha_cita):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El profesional ya tiene una cita agendada en ese horario",
        )

    return create_cita(db, cita_data)


@router.get("", response_model=List[CitaVeterinariaResponse])
def list_citas(
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lista citas según el rol: cliente ve las suyas, profesional las asignadas, admin todas."""
    if usuario_actual.rol == "admin":
        return get_citas(db)

    if usuario_actual.rol == "profesional":
        profesional = get_profesional_by_usuario(db, usuario_actual.id_usuario)
        if not profesional:
            return []
        return get_citas_by_profesional(db, profesional.id_profesional)

    mascotas_propias = get_mascotas_by_usuario(db, usuario_actual.id_usuario)
    ids_mascotas = [mascota.id_mascota for mascota in mascotas_propias]
    return get_citas_by_mascotas(db, ids_mascotas)


def _autorizacion_cita(db: Session, cita, usuario_actual: Usuario):
    """Devuelve (es_admin, es_profesional_asignado, es_dueno_mascota) para una cita dada."""
    mascota = get_mascota_by_id(db, cita.id_mascota)
    profesional = get_profesional_by_id(db, cita.id_profesional)

    es_admin = usuario_actual.rol == "admin"
    es_profesional_asignado = profesional is not None and profesional.id_usuario == usuario_actual.id_usuario
    es_dueno_mascota = mascota is not None and mascota.id_usuario == usuario_actual.id_usuario
    return es_admin, es_profesional_asignado, es_dueno_mascota


@router.get("/{id_cita}", response_model=CitaVeterinariaResponse)
def read_cita(
    id_cita: int,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Devuelve el detalle de una cita (dueño de la mascota, profesional asignado o admin)."""
    cita = get_cita_by_id(db, id_cita)
    if not cita:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cita no encontrada")

    es_admin, es_profesional_asignado, es_dueno_mascota = _autorizacion_cita(db, cita, usuario_actual)
    if not (es_admin or es_profesional_asignado or es_dueno_mascota):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes acceso a esta cita")

    return cita


@router.patch("/{id_cita}", response_model=CitaVeterinariaResponse)
def update_cita_existente(
    id_cita: int,
    cita_data: CitaVeterinariaUpdate,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Actualiza una cita. El profesional asignado o un admin pueden modificar cualquier campo.
    El cliente (dueño de la mascota) solo puede reprogramar `fecha_cita` o cancelar (`estado='cancelada'`).
    """
    cita = get_cita_by_id(db, id_cita)
    if not cita:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cita no encontrada")

    es_admin, es_profesional_asignado, es_dueno_mascota = _autorizacion_cita(db, cita, usuario_actual)
    datos = cita_data.model_dump(exclude_unset=True)

    if not (es_admin or es_profesional_asignado):
        if not es_dueno_mascota:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes acceso a esta cita")

        campos_no_permitidos = set(datos.keys()) - _CAMPOS_PERMITIDOS_CLIENTE
        if campos_no_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Como cliente solo puedes reprogramar (fecha_cita) o cancelar (estado='cancelada') tu cita",
            )
        if "estado" in datos and datos["estado"] != "cancelada":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Como cliente solo puedes cambiar el estado a 'cancelada'",
            )

    if "fecha_cita" in datos and get_cita_conflicto(
        db, cita.id_profesional, datos["fecha_cita"], excluir_id_cita=cita.id_cita
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El profesional ya tiene una cita agendada en ese horario",
        )

    return update_cita(db, cita, datos)
