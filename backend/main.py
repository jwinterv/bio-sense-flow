from fastapi import FastAPI
from routers.dashboard import router as dashboard_router

app = FastAPI()

app.include_router(dashboard_router)

@app.get("/")
def home():
    return {
        "status": "API funcionando!"
    }