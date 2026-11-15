from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.vacuna import VacunaCreate, VacunaUpdate, VacunaResponse
from app.crud.vacuna import (
    get_vacuna_by_id,
    get_vacunas_by_mascota,
    create_vacuna,
    update_vacuna,
    eliminar_vacuna,
)
from app.crud.mascota import get_mascota_by_id
from app.crud.recordatorio import get_recordatorio_by_id
from app.core.security import get_current_user, get_current_admin

router = APIRouter(prefix="/vacunas", tags=["Vacunas"])


def _validar_acceso_mascota(mascota, usuario_actual: Usuario) -> None:
    """Permite la acción solo al dueño de la mascota o a un admin."""
    if mascota.id_usuario != usuario_actual.id_usuario and usuario_actual.rol != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes acceso a esta mascota")


def _validar_recordatorio_de_mascota(db: Session, id_recordatorio, id_mascota: int) -> None:
    """Si se indica un recordatorio, valida que exista y pertenezca a la misma mascota."""
    if id_recordatorio is None:
        return
    recordatorio = get_recordatorio_by_id(db, id_recordatorio)
    if not recordatorio or recordatorio.id_mascota != id_mascota:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El recordatorio indicado no existe o no pertenece a esta mascota",
        )


@router.post("", response_model=VacunaResponse, status_code=status.HTTP_201_CREATED)
def create_vacuna_nueva(
    vacuna_data: VacunaCreate,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Registra una vacuna para una mascota propia (o cualquiera, si es admin)."""
    mascota = get_mascota_by_id(db, vacuna_data.id_mascota)
    if not mascota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La mascota indicada no existe")
    _validar_acceso_mascota(mascota, usuario_actual)
    _validar_recordatorio_de_mascota(db, vacuna_data.id_recordatorio, vacuna_data.id_mascota)
    return create_vacuna(db, vacuna_data)


@router.get("", response_model=List[VacunaResponse])
def list_vacunas(
    id_mascota: int,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lista las vacunas de una mascota (dueño o admin)."""
    mascota = get_mascota_by_id(db, id_mascota)
    if not mascota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La mascota indicada no existe")
    _validar_acceso_mascota(mascota, usuario_actual)
    return get_vacunas_by_mascota(db, id_mascota)


def _obtener_vacuna_autorizada(db: Session, id_vacuna: int, usuario_actual: Usuario):
    """Busca la vacuna y valida que el usuario sea dueño de la mascota asociada o admin."""
    vacuna = get_vacuna_by_id(db, id_vacuna)
    if not vacuna:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vacuna no encontrada")
    mascota = get_mascota_by_id(db, vacuna.id_mascota)
    if mascota:
        _validar_acceso_mascota(mascota, usuario_actual)
    return vacuna


@router.get("/{id_vacuna}", response_model=VacunaResponse)
def read_vacuna(
    id_vacuna: int,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Devuelve el detalle de una vacuna (dueño de la mascota o admin)."""
    return _obtener_vacuna_autorizada(db, id_vacuna, usuario_actual)


@router.patch("/{id_vacuna}", response_model=VacunaResponse)
def update_vacuna_existente(
    id_vacuna: int,
    vacuna_data: VacunaUpdate,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Actualiza parcialmente una vacuna (dueño de la mascota o admin)."""
    vacuna = _obtener_vacuna_autorizada(db, id_vacuna, usuario_actual)
    if vacuna_data.id_recordatorio is not None:
        _validar_recordatorio_de_mascota(db, vacuna_data.id_recordatorio, vacuna.id_mascota)
    return update_vacuna(db, vacuna, vacuna_data)


@router.delete("/{id_vacuna}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vacuna_existente(
    id_vacuna: int,
    usuario_admin: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Elimina físicamente una vacuna. Solo administradores (corrección de errores de captura)."""
    vacuna = get_vacuna_by_id(db, id_vacuna)
    if not vacuna:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vacuna no encontrada")
    eliminar_vacuna(db, vacuna)
