from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.producto import ProductoCreate, ProductoUpdate, ProductoResponse
from app.crud.producto import (
    get_producto_by_id,
    get_productos,
    create_producto,
    update_producto,
    desactivar_producto,
)
from app.crud.profesional import get_profesional_by_usuario
from app.crud.veterinaria import get_veterinaria_by_id
from app.core.security import get_current_user

router = APIRouter(prefix="/productos", tags=["Productos"])


def _validar_gestor_veterinaria(db: Session, id_veterinaria: int, usuario_actual: Usuario) -> None:
    """Permite gestionar productos solo al profesional vinculado a esa veterinaria o a un admin."""
    if usuario_actual.rol == "admin":
        return
    profesional = get_profesional_by_usuario(db, usuario_actual.id_usuario)
    if not profesional or profesional.id_veterinaria != id_veterinaria:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No gestionas esta veterinaria")


@router.post("", response_model=ProductoResponse, status_code=status.HTTP_201_CREATED)
def create_producto_nuevo(
    producto_data: ProductoCreate,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Registra un producto para una veterinaria. Solo el profesional de esa veterinaria o un admin."""
    if not get_veterinaria_by_id(db, producto_data.id_veterinaria):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La veterinaria indicada no existe")
    _validar_gestor_veterinaria(db, producto_data.id_veterinaria, usuario_actual)
    return create_producto(db, producto_data)


@router.get("", response_model=List[ProductoResponse])
def list_productos(
    id_veterinaria: Optional[int] = None,
    categoria: Optional[str] = None,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lista productos, opcionalmente filtrados por veterinaria y/o categoría."""
    return get_productos(db, id_veterinaria, categoria)


@router.get("/{id_producto}", response_model=ProductoResponse)
def read_producto(
    id_producto: int,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Devuelve el detalle de un producto."""
    producto = get_producto_by_id(db, id_producto)
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return producto


@router.patch("/{id_producto}", response_model=ProductoResponse)
def update_producto_existente(
    id_producto: int,
    producto_data: ProductoUpdate,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Actualiza parcialmente un producto. Solo el profesional de esa veterinaria o un admin."""
    producto = get_producto_by_id(db, id_producto)
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    _validar_gestor_veterinaria(db, producto.id_veterinaria, usuario_actual)
    return update_producto(db, producto, producto_data)


@router.delete("/{id_producto}", response_model=ProductoResponse)
def deactivate_producto_existente(
    id_producto: int,
    usuario_actual: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Desactiva (soft delete) un producto. Solo el profesional de esa veterinaria o un admin."""
    producto = get_producto_by_id(db, id_producto)
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    _validar_gestor_veterinaria(db, producto.id_veterinaria, usuario_actual)
    return desactivar_producto(db, producto)
