from sqlalchemy import Column, Integer, Numeric, ForeignKey

from app.database import Base


class DetalleCarrito(Base):
    __tablename__ = "detalle_carrito"

    id_detalle_carrito = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_carrito = Column(Integer, ForeignKey("carrito_compras.id_carrito"), nullable=False, index=True)
    id_producto = Column(Integer, ForeignKey("productos.id_producto"), nullable=False, index=True)
    cantidad = Column(Integer, nullable=False, default=1)
    precio_unitario = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)
