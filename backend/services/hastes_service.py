from database import get_connection

status_map = {
    "Ativa": "online",
    "Manutencao": "manutencao",
    "Inativa": "offline",
}

status_reverse_map = {
    "online": "Ativa",
    "manutencao": "Manutencao",
    "offline": "Inativa",
}

def get_hastes():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            h.id_haste,
            h.nome,
            h.coordenada_x,
            h.coordenada_y,
            d.id_disp,
            d.status,
            d.timestamp
        FROM hastes h
        JOIN dispositivos d
            ON d.id_haste = h.id_haste
        ORDER BY h.id_haste;
    """)

    linhas = cursor.fetchall()

    hastes = []

    for linha in linhas:

        hastes.append({
            "id": str(linha[0]),
            "leiraId": 1,
            "nome": linha[1],
            "coordenadaX": float(linha[2]),
            "coordenadaY": float(linha[3]),
            "status": status_map[linha[5]],
            "ultimaLeitura": linha[6].isoformat()
        })

    cursor.close()
    conn.close()
    
    return hastes

def create_haste(haste):

    conn = get_connection()
    cursor = conn.cursor()

    try:

        cursor.execute("""
            INSERT INTO hastes (
                nome,
                coordenada_x,
                coordenada_y
            )
            VALUES (%s,%s,%s)
            RETURNING id_haste;
        """, (
            haste.nome,
            haste.coordenadaX,
            haste.coordenadaY
        ))

        id_haste = cursor.fetchone()[0]

        cursor.execute("""
            INSERT INTO dispositivos (
                timestamp,
                id_haste,
                status
            )
            VALUES (
                NOW(),
                %s,
                %s
            );
        """, (
            id_haste,
            status_reverse_map[haste.status]
        ))

        conn.commit()

        return {
            "ok": True,
            "id": id_haste
        }

    finally:
        cursor.close()
        conn.close()

def update_haste(id_haste: int, haste):

    conn = get_connection()
    cursor = conn.cursor()

    try:

        cursor.execute("""
            UPDATE hastes
            SET
                nome = %s,
                coordenada_x = %s,
                coordenada_y = %s
            WHERE id_haste = %s;
        """, (
            haste.nome,
            haste.coordenadaX,
            haste.coordenadaY,
            id_haste
        ))

        cursor.execute("""
            UPDATE dispositivos
            SET
                status = %s
            WHERE id_haste = %s;
        """, (
            status_reverse_map[haste.status],
            id_haste
        ))

        conn.commit()

        return {"ok": True}

    finally:
        cursor.close()
        conn.close()

def delete_haste(id_haste: int):

    conn = get_connection()
    cursor = conn.cursor()

    try:

        cursor.execute("""
            DELETE FROM hastes
            WHERE id_haste = %s;
        """, (id_haste,))

        conn.commit()

        return {"ok": True}

    finally:
        cursor.close()
        conn.close()