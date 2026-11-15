from sqlalchemy import Column, Integer, String, Text, Boolean, Numeric

from app.database import Base


class Veterinaria(Base):
    __tablename__ = "veterinarias"

    id_veterinaria = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre_comercial = Column(String(100), nullable=False)
    direccion = Column(Text, nullable=False)
    telefono = Column(String(20), nullable=False)
    correo_electronico = Column(String(100), nullable=True)
    horario_atencion = Column(String(100), nullable=True)
    latitud = Column(Numeric(10, 8), nullable=True)
    longitud = Column(Numeric(11, 8), nullable=True)
    calificacion_promedio = Column(Numeric(3, 2), nullable=False, default=0)
    activo = Column(Boolean, nullable=False, default=True)
