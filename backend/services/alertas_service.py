from datetime import datetime, timedelta
from database import get_connection
from fastapi import HTTPException

# Example usage:
# raise HTTPException(status_code=404, detail="Item not found")

def get_alertas(
    limite=None,
    periodo=None,
    inicio=None,
    fim=None,
    severidade=None,
    status=None,
    hastes=""
):

    conn = get_connection()
    cursor = conn.cursor()

    # ------------------------
    # Período
    # ------------------------

    if periodo == "custom":

        inicio_periodo = inicio
        fim_periodo = fim


    elif periodo:

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

            inicio_periodo = None
            fim_periodo = None

    hastes_lista = (
        [int(h) for h in hastes.split(",")]
        if hastes
        else []
    )

    query = """
    SELECT *
    FROM (

        ----------------------------------------
        -- Erros do dispositivo
        ----------------------------------------

        SELECT
            e.id_erro,
            'disp' AS origem,
            e.timestamp,
            e.id_haste,
            e.grandeza,
            t.gravidade,
            e.resolvido,
            t.descricao,
            t.instrucao

        FROM erros_disp e

        JOIN tipos_erro t
            ON e.id_tipo_erro = t.id_tipo_erro


        UNION ALL


        ----------------------------------------
        -- Erros NPK
        ----------------------------------------

        SELECT
            e.id_erro,
            'npk' AS origem,
            e.timestamp,
            l.id_haste,
            e.grandeza,
            t.gravidade,
            e.resolvido,
            t.descricao,
            t.instrucao

        FROM erros_npk e

        JOIN leituras_npk l
            ON e.id_leitura = l.id_npk

        JOIN tipos_erro t
            ON e.id_tipo_erro = t.id_tipo_erro


        UNION ALL


        ----------------------------------------
        -- Erros Gás
        ----------------------------------------

        SELECT
            e.id_erro,
            'gas' AS origem,
            e.timestamp,
            l.id_haste,
            e.grandeza,
            t.gravidade,
            e.resolvido,
            t.descricao,
            t.instrucao

        FROM erros_gas e

        JOIN leituras_gas l
            ON e.id_leitura = l.id_gas

        JOIN tipos_erro t
            ON e.id_tipo_erro = t.id_tipo_erro

    ) alertas

    WHERE 1=1
    """

    params = []

    if inicio_periodo and fim_periodo:

        query += """
            AND alertas.timestamp BETWEEN %s AND %s
        """

        params.extend([
            inicio_periodo,
            fim_periodo
        ])

    # ------------------------
    # Filtro de severidade
    # ------------------------

    if severidade:

        mapa = {
            "baixa": 1,
            "media": 2,
            "alta": 3,
            "critica": 4
        }

        if severidade in mapa:

            query += """
                AND alertas.gravidade = %s
            """

            params.append(
                mapa[severidade]
            )

    # ------------------------
    # Status
    # ------------------------

    if status == "resolvido":

        query += """
            AND alertas.resolvido = TRUE
        """

    elif status == "ativo":

        query += """
            AND alertas.resolvido = FALSE
        """

    # ------------------------
    # Hastes
    # ------------------------

    if hastes_lista:

        query += """
            AND alertas.id_haste = ANY(%s)
        """

        params.append(
            hastes_lista
        )

    query += """
        ORDER BY timestamp DESC
    """

    if limite is not None:

        query += """
            LIMIT %s
        """

        params.append(
            limite
        )

    cursor.execute(
        query,
        params
    )

    resultados = cursor.fetchall()

    cursor.close()
    conn.close()

    return [
        {
            "id": f"{a[1]}-{a[0]}",
            "idErro": a[0],
            "origem": a[1],
            "data": a[2].isoformat(),
            "hasteId": str(a[3]),
            "tipo": a[4],
            "severidade": a[5],
            "status": "resolvido" if a[6] else "ativo",
            "mensagem": a[7],
            "instrucao": a[8],
        }
        for a in resultados
    ]

def resolver_alerta(id_alerta, origem):

    conn = get_connection()
    cursor = conn.cursor()

    agora = datetime.now()

    if origem == "gas":

        query = """
        UPDATE erros_gas
        SET resolvido = TRUE,
            resolvido_em = %s
        WHERE id_erro = %s
        """

    elif origem == "npk":

        query = """
        UPDATE erros_npk
        SET resolvido = TRUE,
            resolvido_em = %s
        WHERE id_erro = %s
        """

    elif origem == "disp":

        query = """
        UPDATE erros_disp
        SET resolvido = TRUE,
            resolvido_em = %s
        WHERE id_erro = %s
        """

    else:
        raise Exception("Origem inválida")


    cursor.execute(
        query,
        (
            agora,
            id_alerta
        )
    )

    conn.commit()

    cursor.close()
    conn.close()

    return {
        "mensagem": "Alerta resolvido",
        "resolvido_em": agora.isoformat()
    }