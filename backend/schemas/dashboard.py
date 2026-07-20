from pydantic import BaseModel


class DashboardResponse(BaseModel):
    temperaturaMedia: float
    temperaturaMax: float
    umidadeMedia: float
    alertasAtivos: int