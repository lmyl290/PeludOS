from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

from app.config import settings
from app.database import Base

# Importamos los modelos para que Alembic los detecte al autogenerar migraciones.
from app.models.usuario import Usuario
from app.models.mascota import Mascota
from app.models.veterinaria import Veterinaria
from app.models.profesional import Profesional
from app.models.cita_veterinaria import CitaVeterinaria
from app.models.recordatorio import Recordatorio
from app.models.medicamento import Medicamento
from app.models.vacuna import Vacuna
from app.models.producto import Producto
from app.models.carrito_compra import CarritoCompra
from app.models.detalle_carrito import DetalleCarrito
from app.models.pedido import Pedido
from app.models.detalle_pedido import DetallePedido
from app.models.resena import Resena
from app.models.mensaje import Mensaje

# Configuración de logging de Alembic
config = context.config

# Inyectamos la URL real de la base de datos desde nuestro settings
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata usada para el autogenerado de migraciones
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()