from fastapi import APIRouter
from services.hastes_service import get_hastes, create_haste, update_haste, delete_haste
from schemas.haste import HasteCreate

router = APIRouter()


@router.get("/hastes")
def listar_hastes():
    return get_hastes()

@router.post("/hastes")
def criar_haste(haste: HasteCreate):
    return create_haste(haste)

@router.put("/hastes/{id_haste}")
def editar_haste(id_haste: int, haste: HasteCreate):
    return update_haste(id_haste, haste)

@router.delete("/hastes/{id_haste}")
def excluir_haste(id_haste: int):
    return delete_haste(id_haste)