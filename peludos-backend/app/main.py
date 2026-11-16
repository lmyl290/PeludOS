from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    auth,
    usuarios,
    mascotas,
    veterinarias,
    profesionales,
    citas,
    recordatorios,
    medicamentos,
    vacunas,
    productos,
    carrito,
    pedidos,
    resenas,
    mensajes,
)

app = FastAPI(
    title="PeludOS API",
    description="API para la plataforma de cuidado de mascotas",
    version="0.1.0",
)

# === CONFIGURACIÓN DE CORS ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200",
                   "http://68.211.136.57:8083",
                   "http://68.211.136.57"],  # Permite peticiones desde Angular
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, PUT, DELETE, OPTIONS, etc.)
    allow_headers=["*"],  # Permite todas las cabeceras
)

app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(mascotas.router)
app.include_router(veterinarias.router)
app.include_router(profesionales.router)
app.include_router(citas.router)
app.include_router(recordatorios.router)
app.include_router(medicamentos.router)
app.include_router(vacunas.router)
app.include_router(productos.router)
app.include_router(carrito.router)
app.include_router(pedidos.router)
app.include_router(resenas.router)
app.include_router(mensajes.router)


@app.get("/health", tags=["Salud"])
def health_check():
    """
    Endpoint simple para verificar que la API está corriendo
    y respondiendo correctamente.
    """
    return {"status": "ok", "app": "PeludOS API"}