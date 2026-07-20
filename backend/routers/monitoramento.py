from fastapi import APIRouter
from services.monitoramento_service import get_haste, get_hastes_monitoramento

router = APIRouter()

@router.get("/hastes/{id_haste}")
def obter_haste(id_haste: int, sensor: int = 1):
    return get_haste(id_haste, sensor)

@router.get("/monitoramento/hastes")
def monitoramento_hastes():
    return get_hastes_monitoramento()