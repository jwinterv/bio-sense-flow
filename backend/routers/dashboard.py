from fastapi import APIRouter
from services.dashboard_service import get_dashboard
from schemas.dashboard import DashboardResponse

router = APIRouter()


@router.get("/dashboard", response_model=DashboardResponse)
def dashboard():
    return get_dashboard()