from fastapi import APIRouter, Query
from database import get_connection
from datetime import datetime, timedelta

router = APIRouter()

SENSORES = {

    "temperatura": {
        "tabela": "leituras_npk",
        "campo": "temperatura",
        "unidade": "°C",
        "tem_sensor": True
    },

    "umidade": {
        "tabela": "leituras_npk",
        "campo": "umidade",
        "unidade": "%",
        "tem_sensor": True
    },

    "salinidade": {
        "tabela": "leituras_npk",
        "campo": "salinidade",
        "unidade": "",
        "tem_sensor": True
    },

    "ssd": {
        "tabela": "leituras_npk",
        "campo": "ssd",
        "unidade": "",
        "tem_sensor": True
    },

    "nitrogenio": {
        "tabela": "leituras_npk",
        "campo": "nitrogenio",
        "unidade": "mg/kg",
        "tem_sensor": True
    },

    "fosforo": {
        "tabela": "leituras_npk",
        "campo": "fosforo",
        "unidade": "mg/kg",
        "tem_sensor": True
    },

    "potassio": {
        "tabela": "leituras_npk",
        "campo": "potassio",
        "unidade": "mg/kg",
        "tem_sensor": True
    },

    "condutividade": {
        "tabela": "leituras_npk",
        "campo": "condutividade",
        "unidade": "",
        "tem_sensor": True
    },

    "ph": {
        "tabela": "leituras_npk",
        "campo": "ph",
        "unidade": "",
        "tem_sensor": True
    },

    "metano": {
        "tabela": "leituras_gas",
        "campo": "metano",
        "unidade": "ppm",
        "tem_sensor": False
    },

    "amonia": {
        "tabela": "leituras_gas",
        "campo": "amonia",
        "unidade": "ppm",
        "tem_sensor": False
    }
}

@router.get("/historico")
def get_historico(
    sensores: str,
    periodo: str = "24h",
    hastes: str = "",
    sensorId: str = "ambos",
    inicio: datetime | None = None,
    fim: datetime | None = None
):

    conn = get_connection()
    cursor = conn.cursor()

    sensores_lista = sensores.split(",")

    hastes_lista = (
        [int(h) for h in hastes.split(",")]
        if hastes
        else []
    )


    # ==========================
    # Definição do período
    # ==========================

    if periodo == "custom":

        if inicio is None or fim is None:
            cursor.close()
            conn.close()
            raise HTTPException(
                status_code=400,
                detail="Informe inicio e fim para período customizado"
            )

        inicio_periodo = inicio
        fim_periodo = fim


    else:

        agora = datetime.now()

        fim_periodo = agora


        if periodo == "1h":
            inicio_periodo = agora - timedelta(hours=1)

        elif periodo == "6h":
            inicio_periodo = agora - timedelta(hours=6)

        elif periodo == "12h":
            inicio_periodo = agora - timedelta(hours=12)

        elif periodo == "7d":
            inicio_periodo = agora - timedelta(days=7)

        elif periodo == "30d":
            inicio_periodo = agora - timedelta(days=30)

        else:
            inicio_periodo = agora - timedelta(hours=24)



    series = []


    for sensor in sensores_lista:

        if sensor not in SENSORES:
            continue


        info = SENSORES[sensor]

        tabela = info["tabela"]
        campo = info["campo"]


        query = f"""
            SELECT
                timestamp,
                AVG({campo})
            FROM {tabela}
            WHERE timestamp BETWEEN %s AND %s
        """


        params = [
            inicio_periodo,
            fim_periodo
        ]


        if hastes_lista:

            query += """
                AND id_haste = ANY(%s)
            """

            params.append(
                hastes_lista
            )


        if info["tem_sensor"] and sensorId != "ambos":

            query += """
                AND sensor_id = %s
            """

            params.append(
                int(sensorId)
            )


        query += """
            GROUP BY timestamp
            ORDER BY timestamp;
        """


        cursor.execute(
            query,
            params
        )


        dados = []

        for row in cursor.fetchall():

            dados.append({
                "timestamp": row[0].isoformat(),
                "valor": float(row[1])
            })


        series.append({
            "nome": sensor,
            "unidade": info["unidade"],
            "dados": dados
        })


    cursor.close()
    conn.close()


    return {
        "series": series
    }