from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario
from app.models.mascota import Mascota
from app.schemas.mascota import MascotaCreate, MascotaUpdate, MascotaResponse
from app.crud.mascota import (
    get_mascota_by_id,
    get_mascotas_by_usuario,
    create_mascota,
    update_mascota,
    desactivar_mascota,
)
from app.core.security import get_current_user

router = APIRouter(prefix="/mascotas", tags=["Mascotas"])


def _obtener_mascota_autorizada(db: Session, id_mascota: int, usuario_actual: Usuario) -> Mascota:
    """Busca la mascota y valida que el usuario actual sea el dueño o un admin."""
    mascota = get_mascota_by_id(db, id_mascota)
    if not mascota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mascota no encontrada")
    if mascota.id_usuario != usuario_actual.id_usuario and usuario_actual.rol != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes acceso a esta mascota")
    return mascota


@router.post("", response_model=MascotaResponse, status_code=status.HTTP_201_CREATED)
def create_mascota_propia(
    mascota_data: MascotaCreate,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Registra una nueva mascota para el usuario autenticado."""
    return create_mascota(db, mascota_data, usuario_actual.id_usuario)


@router.get("", response_model=List[MascotaResponse])
def list_mascotas_propias(
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lista las mascotas del usuario autenticado."""
    return get_mascotas_by_usuario(db, usuario_actual.id_usuario)


@router.get("/{id_mascota}", response_model=MascotaResponse)
def read_mascota(
    id_mascota: int,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Devuelve el detalle de una mascota (dueño o admin)."""
    return _obtener_mascota_autorizada(db, id_mascota, usuario_actual)


@router.patch("/{id_mascota}", response_model=MascotaResponse)
def update_mascota_propia(
    id_mascota: int,
    mascota_data: MascotaUpdate,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Actualiza parcialmente una mascota (dueño o admin)."""
    mascota = _obtener_mascota_autorizada(db, id_mascota, usuario_actual)
    return update_mascota(db, mascota, mascota_data)


@router.delete("/{id_mascota}", response_model=MascotaResponse)
def deactivate_mascota_propia(
    id_mascota: int,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Desactiva (soft delete) una mascota (dueño o admin)."""
    mascota = _obtener_mascota_autorizada(db, id_mascota, usuario_actual)
    return desactivar_mascota(db, mascota)
