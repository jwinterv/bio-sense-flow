from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.dashboard import router as dashboard_router
from routers.hastes import router as hastes_router
from routers.monitoramento import router as monitoramento_router
from routers.historico import router as historico_router
from routers.alertas import router as alertas_router
from routers.sensores import router as sensores_router

app = FastAPI()

# Permite o frontend acessar o backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas
app.include_router(dashboard_router)
app.include_router(hastes_router)
app.include_router(monitoramento_router)
app.include_router(historico_router)
app.include_router(alertas_router)
app.include_router(sensores_router)