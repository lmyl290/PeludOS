from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.resena import ResenaCreate, ResenaUpdate, ResenaResponse
from app.crud.resena import (
    get_resena_by_id,
    get_resena_activa_por_pedido,
    get_resenas_by_veterinaria,
    get_calificaciones_activas,
    create_resena,
    update_resena,
    desactivar_resena,
)
from app.crud.pedido import get_pedido_by_id
from app.crud.veterinaria import get_veterinaria_by_id, recalcular_calificacion_promedio
from app.core.security import get_current_user

router = APIRouter(prefix="/resenas", tags=["Reseñas"])


def _validar_acceso_propio_o_admin(resena, usuario_actual: Usuario) -> None:
    """Permite la acción solo al dueño de la reseña o a un admin."""
    if resena.id_usuario != usuario_actual.id_usuario and usuario_actual.rol != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes acceso a esta reseña")


def _recalcular_promedio(db: Session, id_veterinaria: int) -> None:
    """Recalcula y persiste calificacion_promedio de la veterinaria tras un cambio en sus reseñas."""
    veterinaria = get_veterinaria_by_id(db, id_veterinaria)
    if veterinaria:
        calificaciones = get_calificaciones_activas(db, id_veterinaria)
        recalcular_calificacion_promedio(db, veterinaria, calificaciones)


@router.post("", response_model=ResenaResponse, status_code=status.HTTP_201_CREATED)
def create_resena_nueva(
    resena_data: ResenaCreate,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Registra una reseña verificada: exige un pedido propio, entregado, de esa veterinaria."""
    if not get_veterinaria_by_id(db, resena_data.id_veterinaria):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La veterinaria indicada no existe")

    pedido = get_pedido_by_id(db, resena_data.id_pedido)
    if not pedido or pedido.id_usuario != usuario_actual.id_usuario or pedido.id_veterinaria != resena_data.id_veterinaria:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El pedido indicado no existe, no es tuyo, o no corresponde a esa veterinaria",
        )
    if pedido.estado_pedido != "entregado":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo puedes reseñar pedidos en estado 'entregado'",
        )
    if get_resena_activa_por_pedido(db, resena_data.id_pedido):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ya existe una reseña para ese pedido")

    nueva_resena = create_resena(db, resena_data, usuario_actual.id_usuario)
    _recalcular_promedio(db, resena_data.id_veterinaria)
    return nueva_resena


@router.get("", response_model=List[ResenaResponse])
def list_resenas(
    id_veterinaria: int,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lista las reseñas de una veterinaria."""
    if not get_veterinaria_by_id(db, id_veterinaria):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La veterinaria indicada no existe")
    return get_resenas_by_veterinaria(db, id_veterinaria)


@router.get("/{id_resena}", response_model=ResenaResponse)
def read_resena(
    id_resena: int,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Devuelve el detalle de una reseña."""
    resena = get_resena_by_id(db, id_resena)
    if not resena:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reseña no encontrada")
    return resena


@router.patch("/{id_resena}", response_model=ResenaResponse)
def update_resena_existente(
    id_resena: int,
    resena_data: ResenaUpdate,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Actualiza parcialmente una reseña. Solo el dueño de la reseña o un admin."""
    resena = get_resena_by_id(db, id_resena)
    if not resena:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reseña no encontrada")
    _validar_acceso_propio_o_admin(resena, usuario_actual)

    resena_actualizada = update_resena(db, resena, resena_data)
    if resena_data.calificacion is not None:
        _recalcular_promedio(db, resena.id_veterinaria)
    return resena_actualizada


@router.delete("/{id_resena}", response_model=ResenaResponse)
def deactivate_resena_existente(
    id_resena: int,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Desactiva (soft delete) una reseña. Solo el dueño de la reseña o un admin."""
    resena = get_resena_by_id(db, id_resena)
    if not resena:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reseña no encontrada")
    _validar_acceso_propio_o_admin(resena, usuario_actual)

    resena_desactivada = desactivar_resena(db, resena)
    _recalcular_promedio(db, resena.id_veterinaria)
    return resena_desactivada
