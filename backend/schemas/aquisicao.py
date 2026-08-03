from pydantic import BaseModel, Field


class ConfiguracaoAquisicaoUpdate(BaseModel):
    intervaloMinutos: int = Field(ge=1, le=1440)
