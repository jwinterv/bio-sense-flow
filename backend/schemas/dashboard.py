from pydantic import BaseModel


class DashboardResponse(BaseModel):
    temperaturaMedia: float
    umidadeMedia: float