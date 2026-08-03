import base64
import hashlib
import hmac
import json
import os
from pathlib import Path
from datetime import datetime, timedelta, timezone

from fastapi import Depends, Header, HTTPException, status

from services.usuarios_service import get_usuario_por_id


def carregar_env_local():
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if not env_path.exists():
        return

    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        if not os.getenv(key):
            os.environ[key] = value.strip().strip('"').strip("'")


carregar_env_local()
AUTH_SECRET = os.getenv("AUTH_SECRET")
if not AUTH_SECRET:
    raise RuntimeError("AUTH_SECRET não foi definida. Configure-a em backend/.env.")
TOKEN_TTL_DAYS = 7


def criar_token(usuario):
    payload = {"sub": usuario["id"], "exp": int((datetime.now(timezone.utc) + timedelta(days=TOKEN_TTL_DAYS)).timestamp())}
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    assinatura = hmac.new(AUTH_SECRET.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{assinatura}"


def get_usuario_atual(authorization: str | None = Header(default=None)):
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise ValueError("token ausente")
        payload_b64, assinatura = authorization.removeprefix("Bearer ").split(".", 1)
        esperada = hmac.new(AUTH_SECRET.encode(), payload_b64.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(assinatura, esperada):
            raise ValueError("assinatura inválida")
        payload = json.loads(base64.urlsafe_b64decode(payload_b64 + "=="))
        if payload["exp"] < int(datetime.now(timezone.utc).timestamp()):
            raise ValueError("token expirado")
        return get_usuario_por_id(payload["sub"])
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sessão inválida.")


def exigir_administrador(usuario=Depends(get_usuario_atual)):
    if usuario["perfil"] != "administrador":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso restrito a administradores.")
    return usuario


def exigir_operador(usuario=Depends(get_usuario_atual)):
    if usuario["perfil"] not in ("administrador", "operador"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso restrito a operadores e administradores.")
    return usuario
