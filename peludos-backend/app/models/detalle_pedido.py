from sqlalchemy import Column, Integer, String, Numeric, ForeignKey

from app.database import Base


class DetallePedido(Base):
    """Snapshot inmutable de precio/cantidad al momento de la compra (independiente del carrito)."""
    __tablename__ = "detalle_pedidos"

    id_detalle_pedido = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_pedido = Column(Integer, ForeignKey("pedidos.id_pedido"), nullable=False, index=True)
    id_producto = Column(Integer, ForeignKey("productos.id_producto"), nullable=False, index=True)
    nombre_producto = Column(String(100), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=False)
