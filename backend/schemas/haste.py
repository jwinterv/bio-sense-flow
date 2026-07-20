from pydantic import BaseModel

class HasteCreate(BaseModel):
    nome: str
    coordenadaX: float
    coordenadaY: float
    status: str