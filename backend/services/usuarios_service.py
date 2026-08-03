import base64
import hashlib
import hmac
import os

from fastapi import HTTPException, status
from psycopg2 import IntegrityError

from database import get_connection


PBKDF2_ITERATIONS = 600_000


def _serialize_usuario(row):
    return {
        "id": str(row[0]),
        "nome": row[1],
        "email": row[2],
        "perfil": row[3],
        "ativo": row[4],
        "ultimoAcesso": row[5].isoformat() if row[5] else None,
    }


def hash_senha(senha: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", senha.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return "pbkdf2_sha256${}${}${}".format(
        PBKDF2_ITERATIONS,
        base64.b64encode(salt).decode("ascii"),
        base64.b64encode(digest).decode("ascii"),
    )


def verificar_senha(senha: str, senha_hash: str) -> bool:
    if senha_hash.startswith("$2"):
        try:
            import bcrypt
            return bcrypt.checkpw(senha.encode("utf-8"), senha_hash.encode("utf-8"))
        except ImportError:
            return False
    try:
        algoritmo, iteracoes, salt_b64, digest_b64 = senha_hash.split("$", 3)
        if algoritmo != "pbkdf2_sha256":
            return False
        digest = hashlib.pbkdf2_hmac(
            "sha256",
            senha.encode("utf-8"),
            base64.b64decode(salt_b64),
            int(iteracoes),
        )
        return hmac.compare_digest(digest, base64.b64decode(digest_b64))
    except (ValueError, TypeError):
        return False


def get_usuarios():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id_usuario, nome, email, perfil, ativo, ultimo_acesso FROM usuarios ORDER BY nome;")
    usuarios = [_serialize_usuario(row) for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return usuarios


def create_usuario(usuario):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id_usuario, nome, email, perfil, ativo, ultimo_acesso;
        """, (usuario.nome, usuario.email.lower(), hash_senha(usuario.senha), usuario.perfil, usuario.ativo))
        resultado = _serialize_usuario(cursor.fetchone())
        conn.commit()
        return resultado
    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="E-mail já cadastrado.")
    finally:
        cursor.close()
        conn.close()


def update_usuario(id_usuario, usuario):
    campos, valores = [], []
    for campo in ("nome", "email", "perfil", "ativo"):
        valor = getattr(usuario, campo)
        if valor is not None:
            campos.append(f"{campo} = %s")
            valores.append(valor.lower() if campo == "email" else valor)
    if usuario.senha:
        campos.append("senha_hash = %s")
        valores.append(hash_senha(usuario.senha))
    if not campos:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Nenhuma alteração informada.")

    conn = get_connection()
    cursor = conn.cursor()
    try:
        valores.append(id_usuario)
        cursor.execute(f"""
            UPDATE usuarios SET {', '.join(campos)}, atualizado_em = NOW()
            WHERE id_usuario = %s
            RETURNING id_usuario, nome, email, perfil, ativo, ultimo_acesso;
        """, valores)
        row = cursor.fetchone()
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado.")
        conn.commit()
        return _serialize_usuario(row)
    except IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="E-mail já cadastrado.")
    finally:
        cursor.close()
        conn.close()


def delete_usuario(id_usuario):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM usuarios WHERE id_usuario = %s RETURNING id_usuario;", (id_usuario,))
    if cursor.fetchone() is None:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado.")
    conn.commit()
    cursor.close()
    conn.close()
    return {"ok": True}


def autenticar_usuario(email: str, senha: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id_usuario, nome, email, perfil, ativo, ultimo_acesso, senha_hash
        FROM usuarios WHERE email = %s;
    """, (email.lower(),))
    row = cursor.fetchone()
    if row is None or not row[4] or not verificar_senha(senha, row[6]):
        cursor.close()
        conn.close()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-mail ou senha inválidos.")
    cursor.execute("UPDATE usuarios SET ultimo_acesso = NOW() WHERE id_usuario = %s;", (row[0],))
    conn.commit()
    cursor.execute("SELECT id_usuario, nome, email, perfil, ativo, ultimo_acesso FROM usuarios WHERE id_usuario = %s;", (row[0],))
    usuario = _serialize_usuario(cursor.fetchone())
    cursor.close()
    conn.close()
    return usuario


def get_usuario_por_id(id_usuario):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id_usuario, nome, email, perfil, ativo, ultimo_acesso
        FROM usuarios WHERE id_usuario = %s AND ativo = TRUE;
    """, (id_usuario,))
    row = cursor.fetchone()
    cursor.close()
    conn.close()
    if row is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sessão inválida.")
    return _serialize_usuario(row)
