from pydantic import BaseModel


class UsuarioCreate(BaseModel):
    nome: str
    email: str
    senha: str
    perfil: str
    ativo: bool = True


class UsuarioUpdate(BaseModel):
    nome: str | None = None
    email: str | None = None
    perfil: str | None = None
    ativo: bool | None = None
    senha: str | None = None
