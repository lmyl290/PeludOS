from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.recordatorio import RecordatorioCreate, RecordatorioUpdate, RecordatorioResponse
from app.crud.recordatorio import (
    get_recordatorio_by_id,
    get_recordatorios_by_mascota,
    create_recordatorio,
    update_recordatorio,
    desactivar_recordatorio,
)
from app.crud.mascota import get_mascota_by_id
from app.core.security import get_current_user

router = APIRouter(prefix="/recordatorios", tags=["Recordatorios"])


def _validar_acceso_mascota(mascota, usuario_actual: Usuario) -> None:
    """Permite la acción solo al dueño de la mascota o a un admin."""
    if mascota.id_usuario != usuario_actual.id_usuario and usuario_actual.rol != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes acceso a esta mascota")


@router.post("", response_model=RecordatorioResponse, status_code=status.HTTP_201_CREATED)
def create_recordatorio_nuevo(
    recordatorio_data: RecordatorioCreate,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Crea un recordatorio para una mascota propia (o cualquiera, si es admin)."""
    mascota = get_mascota_by_id(db, recordatorio_data.id_mascota)
    if not mascota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La mascota indicada no existe")
    _validar_acceso_mascota(mascota, usuario_actual)
    return create_recordatorio(db, recordatorio_data)


@router.get("", response_model=List[RecordatorioResponse])
def list_recordatorios(
    id_mascota: int,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lista los recordatorios de una mascota (dueño o admin)."""
    mascota = get_mascota_by_id(db, id_mascota)
    if not mascota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La mascota indicada no existe")
    _validar_acceso_mascota(mascota, usuario_actual)
    return get_recordatorios_by_mascota(db, id_mascota)


def _obtener_recordatorio_autorizado(db: Session, id_recordatorio: int, usuario_actual: Usuario):
    """Busca el recordatorio y valida que el usuario sea dueño de la mascota asociada o admin."""
    recordatorio = get_recordatorio_by_id(db, id_recordatorio)
    if not recordatorio:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recordatorio no encontrado")
    mascota = get_mascota_by_id(db, recordatorio.id_mascota)
    if mascota:
        _validar_acceso_mascota(mascota, usuario_actual)
    return recordatorio


@router.get("/{id_recordatorio}", response_model=RecordatorioResponse)
def read_recordatorio(
    id_recordatorio: int,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Devuelve el detalle de un recordatorio (dueño de la mascota o admin)."""
    return _obtener_recordatorio_autorizado(db, id_recordatorio, usuario_actual)


@router.patch("/{id_recordatorio}", response_model=RecordatorioResponse)
def update_recordatorio_existente(
    id_recordatorio: int,
    recordatorio_data: RecordatorioUpdate,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Actualiza parcialmente un recordatorio (dueño de la mascota o admin)."""
    recordatorio = _obtener_recordatorio_autorizado(db, id_recordatorio, usuario_actual)
    return update_recordatorio(db, recordatorio, recordatorio_data)


@router.delete("/{id_recordatorio}", response_model=RecordatorioResponse)
def deactivate_recordatorio_existente(
    id_recordatorio: int,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Desactiva (soft delete) un recordatorio (dueño de la mascota o admin)."""
    recordatorio = _obtener_recordatorio_autorizado(db, id_recordatorio, usuario_actual)
    return desactivar_recordatorio(db, recordatorio)
