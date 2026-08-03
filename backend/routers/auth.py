from fastapi import APIRouter, Depends

from schemas.auth import LoginRequest
from services.auth_service import criar_token, get_usuario_atual
from services.usuarios_service import autenticar_usuario

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/login")
def login(credenciais: LoginRequest):
    usuario = autenticar_usuario(credenciais.email, credenciais.senha)
    return {"token": criar_token(usuario), "usuario": usuario}


@router.get("/me")
def me(usuario=Depends(get_usuario_atual)):
    return usuario
