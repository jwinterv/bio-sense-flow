from database import get_connection

status_map = {
    "Ativa": "online",
    "Manutencao": "manutencao",
    "Inativa": "offline",
}


def get_haste(id_haste: int, sensor: int):

    conn = get_connection()
    cursor = conn.cursor()

    # ==========================
    # Dados da haste
    # ==========================

    cursor.execute("""
        SELECT
            nome,
            coordenada_x,
            coordenada_y
        FROM hastes
        WHERE id_haste = %s;
    """, (id_haste,))

    haste = cursor.fetchone()

    if haste is None:
        cursor.close()
        conn.close()
        return None

    # ==========================
    # Último estado do dispositivo
    # ==========================

    cursor.execute("""
        SELECT
            status,
            temperatura_disp,
            tensao,
            corrente,
            inclinacao,
            timestamp
        FROM dispositivos
        WHERE id_haste = %s
        ORDER BY timestamp DESC
        LIMIT 1;
    """, (id_haste,))

    dispositivo = cursor.fetchone()

    # ==========================
    # Última leitura NPK
    # ==========================

    cursor.execute("""
        SELECT
            temperatura,
            umidade,
            salinidade,
            ssd,
            nitrogenio,
            fosforo,
            potassio,
            condutividade,
            ph,
            timestamp
        FROM leituras_npk
        WHERE id_haste = %s
          AND sensor_id = %s
        ORDER BY timestamp DESC
        LIMIT 1;
    """, (id_haste, sensor))

    npk = cursor.fetchone()

    # ==========================
    # Última leitura de gás
    # ==========================

    cursor.execute("""
        SELECT
            metano,
            amonia,
            timestamp
        FROM leituras_gas
        WHERE id_haste = %s
        ORDER BY timestamp DESC
        LIMIT 1;
    """, (id_haste,))

    gas = cursor.fetchone()

    cursor.close()
    conn.close()

    return {
        "id": id_haste,
        "sensorSelecionado": sensor,

        "nome": haste[0],
        "coordenadaX": float(haste[1]),
        "coordenadaY": float(haste[2]),

        "dispositivo": {
            "status": status_map[dispositivo[0]] if dispositivo else None,
            "temperatura": float(dispositivo[1]) if dispositivo and dispositivo[1] is not None else None,
            "tensao": float(dispositivo[2]) if dispositivo and dispositivo[2] is not None else None,
            "corrente": float(dispositivo[3]) if dispositivo and dispositivo[3] is not None else None,
            "inclinacao": float(dispositivo[4]) if dispositivo and dispositivo[4] is not None else None,
            "timestamp": dispositivo[5].isoformat() if dispositivo else None,
        },

        "solo": {
            "temperatura": float(npk[0]) if npk and npk[0] is not None else None,
            "umidade": float(npk[1]) if npk and npk[1] is not None else None,
            "salinidade": float(npk[2]) if npk and npk[2] is not None else None,
            "ssd": float(npk[3]) if npk and npk[3] is not None else None,
            "nitrogenio": float(npk[4]) if npk and npk[4] is not None else None,
            "fosforo": float(npk[5]) if npk and npk[5] is not None else None,
            "potassio": float(npk[6]) if npk and npk[6] is not None else None,
            "condutividade": float(npk[7]) if npk and npk[7] is not None else None,
            "ph": float(npk[8]) if npk and npk[8] is not None else None,
            "timestamp": npk[9].isoformat() if npk else None,
        },

        "gas": {
            "metano": float(gas[0]) if gas and gas[0] is not None else None,
            "amonia": float(gas[1]) if gas and gas[1] is not None else None,
            "timestamp": gas[2].isoformat() if gas else None,
        }
    }

def get_hastes_monitoramento():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            id_haste,
            nome,
            coordenada_x,
            coordenada_y
        FROM hastes;
    """)

    hastes = cursor.fetchall()

    resultado = []

    for h in hastes:

        id_haste = h[0]

        # Último status do dispositivo
        cursor.execute("""
            SELECT
                status,
                timestamp
            FROM dispositivos
            WHERE id_haste = %s
            ORDER BY timestamp DESC
            LIMIT 1;
        """, (id_haste,))

        dispositivo = cursor.fetchone()


        # Última temperatura do solo
        cursor.execute("""
            SELECT
                temperatura,
                timestamp
            FROM leituras_npk
            WHERE id_haste = %s
            ORDER BY timestamp DESC
            LIMIT 1;
        """, (id_haste,))

        npk = cursor.fetchone()


        resultado.append({
            "id": str(id_haste),
            "nome": h[1],

            "coordenadaX": float(h[2]),
            "coordenadaY": float(h[3]),

            "temperatura": (
                float(npk[0])
                if npk and npk[0] is not None
                else None
            ),

            "status": (
                status_map.get(dispositivo[0])
                if dispositivo
                else "offline"
            ),

            "ultimaLeitura": (
                dispositivo[1].isoformat()
                if dispositivo
                else None
            )
        })


    cursor.close()
    conn.close()

    return resultado