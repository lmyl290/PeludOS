from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.medicamento import MedicamentoCreate, MedicamentoUpdate, MedicamentoResponse
from app.crud.medicamento import (
    get_medicamento_by_id,
    get_medicamentos_by_mascota,
    create_medicamento,
    update_medicamento,
    desactivar_medicamento,
)
from app.crud.mascota import get_mascota_by_id
from app.crud.recordatorio import get_recordatorio_by_id
from app.core.security import get_current_user

router = APIRouter(prefix="/medicamentos", tags=["Medicamentos"])


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


@router.post("", response_model=MedicamentoResponse, status_code=status.HTTP_201_CREATED)
def create_medicamento_nuevo(
    medicamento_data: MedicamentoCreate,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Registra un medicamento para una mascota propia (o cualquiera, si es admin)."""
    mascota = get_mascota_by_id(db, medicamento_data.id_mascota)
    if not mascota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La mascota indicada no existe")
    _validar_acceso_mascota(mascota, usuario_actual)
    _validar_recordatorio_de_mascota(db, medicamento_data.id_recordatorio, medicamento_data.id_mascota)
    return create_medicamento(db, medicamento_data)


@router.get("", response_model=List[MedicamentoResponse])
def list_medicamentos(
    id_mascota: int,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lista los medicamentos de una mascota (dueño o admin)."""
    mascota = get_mascota_by_id(db, id_mascota)
    if not mascota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La mascota indicada no existe")
    _validar_acceso_mascota(mascota, usuario_actual)
    return get_medicamentos_by_mascota(db, id_mascota)


def _obtener_medicamento_autorizado(db: Session, id_medicamento: int, usuario_actual: Usuario):
    """Busca el medicamento y valida que el usuario sea dueño de la mascota asociada o admin."""
    medicamento = get_medicamento_by_id(db, id_medicamento)
    if not medicamento:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medicamento no encontrado")
    mascota = get_mascota_by_id(db, medicamento.id_mascota)
    if mascota:
        _validar_acceso_mascota(mascota, usuario_actual)
    return medicamento


@router.get("/{id_medicamento}", response_model=MedicamentoResponse)
def read_medicamento(
    id_medicamento: int,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Devuelve el detalle de un medicamento (dueño de la mascota o admin)."""
    return _obtener_medicamento_autorizado(db, id_medicamento, usuario_actual)


@router.patch("/{id_medicamento}", response_model=MedicamentoResponse)
def update_medicamento_existente(
    id_medicamento: int,
    medicamento_data: MedicamentoUpdate,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Actualiza parcialmente un medicamento (dueño de la mascota o admin)."""
    medicamento = _obtener_medicamento_autorizado(db, id_medicamento, usuario_actual)
    if medicamento_data.id_recordatorio is not None:
        _validar_recordatorio_de_mascota(db, medicamento_data.id_recordatorio, medicamento.id_mascota)
    return update_medicamento(db, medicamento, medicamento_data)


@router.delete("/{id_medicamento}", response_model=MedicamentoResponse)
def deactivate_medicamento_existente(
    id_medicamento: int,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Desactiva (soft delete) un medicamento (dueño de la mascota o admin)."""
    medicamento = _obtener_medicamento_autorizado(db, id_medicamento, usuario_actual)
    return desactivar_medicamento(db, medicamento)
