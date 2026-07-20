from database import get_connection

def get_dashboard():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT 
        AVG(l.temperatura) AS temperatura_media,
        MAX(l.temperatura) AS temperatura_max,
        AVG(l.umidade) AS umidade_media
    FROM leituras_npk l
    WHERE l.temperatura IS NOT NULL
        AND l.umidade IS NOT NULL
        AND NOT EXISTS (
            SELECT 1
            FROM erros_npk e
            WHERE e.id_leitura = l.id_npk
        );
    """)

    resultado = cursor.fetchone()

    temperatura_media = round(resultado[0], 1)
    umidade_media = round(resultado[1], 1)
    temperatura_max = round(resultado[2], 1)

    cursor.execute("""
    SELECT COUNT(*)
    FROM erros_disp
    WHERE resolvido = FALSE;
    """)

    erros_disp = cursor.fetchone()[0]


    cursor.execute("""
        SELECT COUNT(*)
        FROM erros_npk
        WHERE resolvido = FALSE;
    """)

    erros_npk = cursor.fetchone()[0]


    cursor.execute("""
        SELECT COUNT(*)
        FROM erros_gas
        WHERE resolvido = FALSE;
    """)

    erros_gas = cursor.fetchone()[0]


    alertas_ativos = erros_disp + erros_npk + erros_gas

    cursor.close()
    conn.close()

    return {
        "temperaturaMedia": temperatura_media,
        "temperaturaMax": temperatura_max,
        "umidadeMedia": umidade_media,
        "alertasAtivos": alertas_ativos
    }

def get_historico(grandeza: str, horas: int = 24):

    colunas_validas = {
        "temperatura": "temperatura",
        "umidade": "umidade"
    }

    if grandeza not in colunas_validas:
        raise ValueError("Grandeza inválida")

    coluna = colunas_validas[grandeza]

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(f"""
        SELECT 
            timestamp,
            {coluna}
        FROM leituras_npk
        WHERE {coluna} IS NOT NULL
        AND timestamp >= NOW() - INTERVAL '{horas} hours'
        ORDER BY timestamp ASC;
    """)

    resultados = cursor.fetchall()

    cursor.close()
    conn.close()

    return [
        {
            "timestamp": linha[0],
            "valor": linha[1]
        }
        for linha in resultados
    ]

def get_hastes():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            h.id_haste,
            d.status,
            d.timestamp
        FROM hastes h
        LEFT JOIN dispositivos d
            ON h.id_haste = d.id_haste
        ORDER BY h.id_haste;
    """)

    dados = cursor.fetchall()

    cursor.close()
    conn.close()

    return [
        {
            "id": str(row[0]),
            "nome": f"Haste {row[0]}",
            "status": (
                "online"
                if row[1] == "Ativa"
                else "offline"
            ),
            "ultimaLeitura": row[2].isoformat() if row[2] else None,
        }
        for row in dados
    ]