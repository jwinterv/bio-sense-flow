from pydantic import BaseModel


class SensorUpdate(BaseModel):
    limiarInferior: float
    limiarSuperior: float
    operacaoMin: float
    operacaoMax: float