from database import get_connection

def get_dashboard():

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    SELECT 
        AVG(temperatura),
        AVG(umidade)
    FROM leituras_npk
    WHERE temperatura IS NOT NULL
        AND umidade IS NOT NULL;
    """)

    resultado = cursor.fetchone()

    temperatura_media = resultado[0]
    umidade_media = resultado[1]

    cursor.close()
    conn.close()

    return {
        "temperaturaMedia": temperatura_media,
        "umidadeMedia": umidade_media
    }