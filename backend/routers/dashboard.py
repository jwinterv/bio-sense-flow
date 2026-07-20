from fastapi import APIRouter
from services.dashboard_service import get_dashboard, get_historico
from services.alertas_service import get_alertas
from services.hastes_service import get_hastes
from schemas.dashboard import DashboardResponse
from typing import Optional
from datetime import datetime

router = APIRouter()


@router.get("/api/dashboard", response_model=DashboardResponse, include_in_schema=False)
@router.get("/dashboard", response_model=DashboardResponse)
def dashboard():
    return get_dashboard()

@router.get("/api/historico/{grandeza}", include_in_schema=False)
@router.get("/historico/{grandeza}")
def historico(grandeza: str, horas: int = 24):
    return get_historico(grandeza, horas)

@router.get("/api/alertas", include_in_schema=False)
@router.get("/alertas")
def alertas(
    limite: Optional[datetime] = None,
    periodo: str = "24h",
    inicio: Optional[datetime] = None,
    fim: Optional[datetime] = None,
    severidade: Optional[str] = None,
    status: str = "ativo",
    hastes: str = "",
):
    return get_alertas(
        limite=limite,
        periodo=periodo,
        inicio=inicio,
        fim=fim,
        severidade=severidade,
        status=status,
        hastes=hastes,
    )

@router.get("/hastes")
def listar_hastes():
    return get_hastes()