from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class CarritoCompra(Base):
    __tablename__ = "carrito_compras"

    id_carrito = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False, index=True)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    estado = Column(String(20), nullable=False, default="activo")
