from sqlalchemy import Column, Integer, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class Mensaje(Base):
    __tablename__ = "mensajes"

    id_mensaje = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_usuario_remitente = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False, index=True)
    id_usuario_destinatario = Column(Integer, ForeignKey("usuarios.id_usuario"), nullable=False, index=True)
    id_veterinaria = Column(Integer, ForeignKey("veterinarias.id_veterinaria"), nullable=True, index=True)
    id_cita = Column(Integer, ForeignKey("citas_veterinarias.id_cita"), nullable=True, index=True)
    contenido = Column(Text, nullable=False)
    leido = Column(Boolean, nullable=False, default=False)
    fecha_envio = Column(DateTime(timezone=True), server_default=func.now())
