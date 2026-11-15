from sqlalchemy import Column, Integer, String, Text, Boolean, Numeric, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.database import Base


class Producto(Base):
    __tablename__ = "productos"

    id_producto = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_veterinaria = Column(Integer, ForeignKey("veterinarias.id_veterinaria"), nullable=False, index=True)
    nombre_producto = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)
    categoria = Column(String(30), nullable=True)
    precio_compra = Column(Numeric(10, 2), nullable=False)
    precio_venta = Column(Numeric(10, 2), nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    unidad_medida = Column(String(20), nullable=True)
    imagen_url = Column(Text, nullable=True)
    activo = Column(Boolean, nullable=False, default=True)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
