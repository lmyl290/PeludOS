from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario
from app.models.profesional import Profesional
from app.schemas.profesional import ProfesionalCreate, ProfesionalUpdate, ProfesionalResponse
from app.crud.profesional import (
    get_profesional_by_id,
    get_profesional_by_usuario,
    get_profesionales,
    create_profesional,
    update_profesional,
    desactivar_profesional,
)
from app.crud.veterinaria import get_veterinaria_by_id
from app.crud.usuario import get_usuario_by_id
from app.core.security import get_current_user, get_current_admin

router = APIRouter(prefix="/profesionales", tags=["Profesionales"])


@router.post("", response_model=ProfesionalResponse, status_code=status.HTTP_201_CREATED)
def create_profesional_nuevo(
    profesional_data: ProfesionalCreate,
    usuario_admin: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Vincula un usuario (rol='profesional') a una veterinaria. Solo administradores."""
    usuario_vinculado = get_usuario_by_id(db, profesional_data.id_usuario)
    if not usuario_vinculado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El usuario indicado no existe")
    if usuario_vinculado.rol != "profesional":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario debe tener rol 'profesional' antes de vincularlo",
        )
    if get_profesional_by_usuario(db, profesional_data.id_usuario):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este usuario ya está vinculado a un perfil profesional",
        )
    if not get_veterinaria_by_id(db, profesional_data.id_veterinaria):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La veterinaria indicada no existe")

    return create_profesional(db, profesional_data)


@router.get("", response_model=List[ProfesionalResponse])
def list_profesionales(
    id_veterinaria: Optional[int] = None,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lista profesionales, opcionalmente filtrados por veterinaria."""
    return get_profesionales(db, id_veterinaria)


@router.get("/me", response_model=ProfesionalResponse)
def read_current_profesional(
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Devuelve el perfil profesional del usuario autenticado."""
    profesional = get_profesional_by_usuario(db, usuario_actual.id_usuario)
    if not profesional:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No tienes un perfil profesional vinculado")
    return profesional


@router.get("/{id_profesional}", response_model=ProfesionalResponse)
def read_profesional(
    id_profesional: int,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Devuelve el detalle de un profesional."""
    profesional = get_profesional_by_id(db, id_profesional)
    if not profesional:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profesional no encontrado")
    return profesional


def _validar_acceso_propio_o_admin(profesional: Profesional, usuario_actual: Usuario) -> None:
    """Permite la acción solo al dueño del perfil profesional o a un admin."""
    if profesional.id_usuario != usuario_actual.id_usuario and usuario_actual.rol != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes acceso a este profesional")


@router.patch("/{id_profesional}", response_model=ProfesionalResponse)
def update_profesional_existente(
    id_profesional: int,
    profesional_data: ProfesionalUpdate,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Actualiza parcialmente un profesional (el propio profesional o un admin)."""
    profesional = get_profesional_by_id(db, id_profesional)
    if not profesional:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profesional no encontrado")
    _validar_acceso_propio_o_admin(profesional, usuario_actual)
    return update_profesional(db, profesional, profesional_data)


@router.delete("/{id_profesional}", response_model=ProfesionalResponse)
def deactivate_profesional_existente(
    id_profesional: int,
    usuario_admin: Usuario = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Desactiva (soft delete) un profesional. Solo administradores."""
    profesional = get_profesional_by_id(db, id_profesional)
    if not profesional:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profesional no encontrado")
    return desactivar_profesional(db, profesional)
