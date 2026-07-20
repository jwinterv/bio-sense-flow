from database import get_connection
from schemas.sensor import SensorUpdate

SENSORES = {
    "temperatura": {
        "tipo": "NPK",
        "unidade": "°C",
    },
    "umidade": {
        "tipo": "NPK",
        "unidade": "%",
    },
    "salinidade": {
        "tipo": "NPK",
        "unidade": "g/L",
    },
    "ssd": {
        "tipo": "NPK",
        "unidade": "mg/L",
    },
    "nitrogenio": {
        "tipo": "NPK",
        "unidade": "mg/L",
    },
    "fosforo": {
        "tipo": "NPK",
        "unidade": "mg/L",
    },
    "potassio": {
        "tipo": "NPK",
        "unidade": "mg/L",
    },
    "condutividade": {
        "tipo": "NPK",
        "unidade": "µS/cm",
    },
    "ph": {
        "tipo": "NPK",
        "unidade": "pH",
    },
    "metano": {
        "tipo": "Gás",
        "unidade": "ppm",
    },
    "amonia": {
        "tipo": "Gás",
        "unidade": "ppm",
    },
        "inclinacao": {
        "tipo": "Dispositivo",
        "unidade": "°",
    },
        "tensao": {
        "tipo": "Dispositivo",
        "unidade": "V",
    },
        "corrente": {
        "tipo": "Dispositivo",
        "unidade": "mA",
    },
        "temperatura_disp": {
        "tipo": "Dispositivo",
        "unidade": "°C",
    },
}


def get_sensores():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            id_limiar,
            grandeza_fisica,
            limiar_inferior,
            limiar_superior,
            operacao_min,
            operacao_max
        FROM limiar_sensores
        ORDER BY id_limiar;
    """)

    linhas = cursor.fetchall()

    sensores = []

    for linha in linhas:

        grandeza = linha[1].lower()

        info = SENSORES.get(grandeza, {
            "tipo": "Outro",
            "unidade": "-"
        })

        sensores.append({
            "id": linha[0],
            "sensor": linha[1],
            "tipo": info["tipo"],
            "unidade": info["unidade"],
            "limiarInferior": float(linha[2]),
            "limiarSuperior": float(linha[3]),
            "operacaoMin": float(linha[4]),
            "operacaoMax": float(linha[5]),
        })

    cursor.close()
    conn.close()

    return sensores

def update_sensor(id_limiar: int, sensor: SensorUpdate):

    conn = get_connection()
    cursor = conn.cursor()

    try:

        cursor.execute("""
            UPDATE limiar_sensores
            SET
                limiar_inferior = %s,
                limiar_superior = %s,
                operacao_min = %s,
                operacao_max = %s
            WHERE id_limiar = %s;
        """, (
            sensor.limiarInferior,
            sensor.limiarSuperior,
            sensor.operacaoMin,
            sensor.operacaoMax,
            id_limiar
        ))

        conn.commit()

        return {"ok": True}

    finally:
        cursor.close()
        conn.close()