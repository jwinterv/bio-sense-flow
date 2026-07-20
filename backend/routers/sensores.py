from fastapi import APIRouter
from schemas.sensor import SensorUpdate
from services.sensores_service import get_sensores, update_sensor

router = APIRouter()

@router.get("/sensores")
def listar_sensores():
    return get_sensores()

@router.put("/sensores/{id}")
def editar_sensor(id: int, sensor: SensorUpdate):
    return update_sensor(id, sensor)