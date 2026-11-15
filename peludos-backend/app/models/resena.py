from sqlalchemy import Column, Integer, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class Resena(Base):
    __tablename__ = "resenas"

    id_resena = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False, index=True)
    id_veterinaria = Column(Integer, ForeignKey("veterinarias.id_veterinaria"), nullable=False, index=True)
    id_pedido = Column(Integer, ForeignKey("pedidos.id_pedido"), nullable=True, index=True)
    calificacion = Column(Integer, nullable=False)
    comentario = Column(Text, nullable=True)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    activo = Column(Boolean, nullable=False, default=True)
