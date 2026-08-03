from fastapi import APIRouter, Depends

from schemas.usuario import UsuarioCreate, UsuarioUpdate
from services.usuarios_service import create_usuario, delete_usuario, get_usuarios, update_usuario
from services.auth_service import exigir_administrador

router = APIRouter(prefix="/usuarios", tags=["Usuários"])


@router.get("")
def listar_usuarios(_admin=Depends(exigir_administrador)):
    return get_usuarios()


@router.post("")
def criar_usuario(usuario: UsuarioCreate, _admin=Depends(exigir_administrador)):
    return create_usuario(usuario)


@router.put("/{id_usuario}")
def editar_usuario(id_usuario: str, usuario: UsuarioUpdate, _admin=Depends(exigir_administrador)):
    return update_usuario(id_usuario, usuario)


@router.delete("/{id_usuario}")
def excluir_usuario(id_usuario: str, _admin=Depends(exigir_administrador)):
    return delete_usuario(id_usuario)
