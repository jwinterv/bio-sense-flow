from fastapi import APIRouter, status

from schemas.aquisicao import ConfiguracaoAquisicaoUpdate
from services.aquisicao_service import (
    get_configuracao_aquisicao,
    solicitar_leitura_manual,
    update_configuracao_aquisicao,
)

router = APIRouter(prefix="/aquisicao", tags=["Aquisicao"])


@router.get("/configuracao")
def obter_configuracao():
    return get_configuracao_aquisicao()


@router.put("/configuracao")
def editar_configuracao(configuracao: ConfiguracaoAquisicaoUpdate):
    return update_configuracao_aquisicao(configuracao.intervaloMinutos)


@router.post("/leituras/manual", status_code=status.HTTP_202_ACCEPTED)
def forcar_leitura():
    return solicitar_leitura_manual()
