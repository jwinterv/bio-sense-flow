from fastapi import APIRouter
from database import get_connection
from typing import Optional
from datetime import datetime
from services.alertas_service import get_alertas, resolver_alerta

router = APIRouter()


@router.get("/alertas")

def alertas(
    limite: Optional[int] = None,
    periodo: Optional[datetime] = None,
    inicio: Optional[datetime] = None,
    fim: Optional[datetime] = None,
    severidade: Optional[str] = None,
    status: Optional[str] = None,
    hastes: str = "",
):
    print(
        "FILTROS:",
        severidade,
        status,
        hastes
    )
    return get_alertas(
        limite=limite,
        periodo=periodo,
        inicio=inicio,
        fim=fim,
        severidade=severidade,
        status=status,
        hastes=hastes,
    )

@router.put("/alertas/{id_alerta}/resolver")
def resolver(
    id_alerta: int,
    origem: str
):

    return resolver_alerta(
        id_alerta,
        origem
    )