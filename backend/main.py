import psycopg2
from psycopg2.extras import RealDictCursor

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import get_connection

from routers.dashboard import router as dashboard_router
from routers.hastes import router as hastes_router
from routers.monitoramento import router as monitoramento_router
from routers.historico import router as historico_router
from routers.alertas import router as alertas_router
from routers.sensores import router as sensores_router

import smtplib
from datetime import datetime
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText 

from fastapi import BackgroundTasks, FastAPI, HTTPException
from jinja2 import Template
from weasyprint import HTML

# Import seguro do WeasyPrint (avisa no terminal se faltar DLL no Windows)
try:
    from weasyprint import HTML

    WEASYPRINT_DISPONIVEL = True
except OSError as e:
    WEASYPRINT_DISPONIVEL = False
    print(
        "⚠️ AVISO: WeasyPrint não pôde carregar as bibliotecas nativas (GTK)."
    )
    print(
        "Se estiver no Windows, instale o GTK3. Se for no Raspberry Pi, rode: sudo apt install libpango-1.0-0"
    )

app = FastAPI()

# Permite o frontend acessar o backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas
app.include_router(dashboard_router)
app.include_router(hastes_router)
app.include_router(monitoramento_router)
app.include_router(historico_router)
app.include_router(alertas_router)
app.include_router(sensores_router)


# Configuracao do email
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_REMETENTE = "flsopenha23@gmail.com"
SENHA_REMETENTE = "zkdlvoffbaismpsc"


# Func para busca no banco
def buscar_leituras_banco(
    haste_id: int,
    data_inicio: str,
    data_fim: str,
    hora_inicio: str = "00:00",
    hora_fim: str = "23:59",
):
    conn = None
    cur = None
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)

        # Une a data selecionada com a hora exata informada pelo operador
        inicio_dt = f"{data_inicio} {hora_inicio}:00"
        fim_dt = f"{data_fim} {hora_fim}:59"

        print(
            f"🔍 Buscando leituras da haste {haste_id} | {inicio_dt} até {fim_dt}"
        )

        query = """
        SELECT
            TO_CHAR(n.timestamp, 'DD/MM/YYYY HH24:MI:SS') AS data_hora,

            MAX(CASE WHEN n.sensor_id = 1 THEN n.temperatura END)     AS temperatura_s1,
            MAX(CASE WHEN n.sensor_id = 2 THEN n.temperatura END)     AS temperatura_s2,

            MAX(CASE WHEN n.sensor_id = 1 THEN n.umidade END)         AS umidade_s1,
            MAX(CASE WHEN n.sensor_id = 2 THEN n.umidade END)         AS umidade_s2,

            MAX(CASE WHEN n.sensor_id = 1 THEN n.salinidade END)      AS salinidade_s1,
            MAX(CASE WHEN n.sensor_id = 2 THEN n.salinidade END)      AS salinidade_s2,

            MAX(CASE WHEN n.sensor_id = 1 THEN n.ssd END)             AS ssd_s1,
            MAX(CASE WHEN n.sensor_id = 2 THEN n.ssd END)             AS ssd_s2,

            MAX(CASE WHEN n.sensor_id = 1 THEN n.nitrogenio END)      AS nitrogenio_s1,
            MAX(CASE WHEN n.sensor_id = 2 THEN n.nitrogenio END)      AS nitrogenio_s2,

            MAX(CASE WHEN n.sensor_id = 1 THEN n.fosforo END)         AS fosforo_s1,
            MAX(CASE WHEN n.sensor_id = 2 THEN n.fosforo END)         AS fosforo_s2,

            MAX(CASE WHEN n.sensor_id = 1 THEN n.potassio END)        AS potassio_s1,
            MAX(CASE WHEN n.sensor_id = 2 THEN n.potassio END)        AS potassio_s2,

            MAX(CASE WHEN n.sensor_id = 1 THEN n.condutividade END)   AS condutividade_s1,
            MAX(CASE WHEN n.sensor_id = 2 THEN n.condutividade END)   AS condutividade_s2,

            MAX(CASE WHEN n.sensor_id = 1 THEN n.ph END)              AS ph_s1,
            MAX(CASE WHEN n.sensor_id = 2 THEN n.ph END)              AS ph_s2,

            MAX(g.metano) AS metano,
            MAX(g.amonia) AS amonia

        FROM leituras_npk n

        LEFT JOIN leituras_gas g
            ON g.id_haste = n.id_haste
            AND g.timestamp = n.timestamp

        WHERE n.id_haste = %s
        AND n.timestamp BETWEEN %s AND %s

        GROUP BY n.timestamp

        ORDER BY n.timestamp;
        """
        cur.execute(query, (haste_id, inicio_dt, fim_dt))
        resultado = cur.fetchall()

        print(
            f"📊 {len(resultado)} registros encontrados para a haste {haste_id}"
        )   
        return resultado

    except Exception as e:
        print(f"❌ [ERRO BANCO DE DADOS]: {e}")
        return []
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def buscar_leituras_npk(
    haste_id: int,
    sensor_id: int,
    data_inicio: str,
    data_fim: str,
    hora_inicio: str = "00:00",
    hora_fim: str = "23:59",
):
    inicio_dt = datetime.strptime(
        f"{data_inicio} {hora_inicio}",
        "%Y-%m-%d %H:%M"
    )

    fim_dt = datetime.strptime(
        f"{data_fim} {hora_fim}",
        "%Y-%m-%d %H:%M"
    )

    conn = get_connection()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            query = """
            SELECT
                TO_CHAR(timestamp,'DD/MM/YYYY HH24:MI:SS') AS data_hora,

                temperatura,
                umidade,
                salinidade,
                ssd,
                nitrogenio,
                fosforo,
                potassio,
                condutividade,
                ph

            FROM leituras_npk

            WHERE id_haste = %s
              AND sensor_id = %s
              AND timestamp BETWEEN %s AND %s

            ORDER BY timestamp;
            """

            cur.execute(
                query,
                (
                    haste_id,
                    sensor_id,
                    inicio_dt,
                    fim_dt,
                ),
            )

            return cur.fetchall()

    finally:
        conn.close()

def buscar_sensor1(
    haste_id,
    data_inicio,
    data_fim,
    hora_inicio="00:00",
    hora_fim="23:59",
):
    return buscar_leituras_npk(
        haste_id,
        1,
        data_inicio,
        data_fim,
        hora_inicio,
        hora_fim,
    )

def buscar_sensor2(
    haste_id,
    data_inicio,
    data_fim,
    hora_inicio="00:00",
    hora_fim="23:59",
):
    return buscar_leituras_npk(
        haste_id,
        2,
        data_inicio,
        data_fim,
        hora_inicio,
        hora_fim,
    )

def buscar_gases(
    haste_id: int,
    data_inicio: str,
    data_fim: str,
    hora_inicio: str = "00:00",
    hora_fim: str = "23:59",
):
    inicio_dt = datetime.strptime(
        f"{data_inicio} {hora_inicio}",
        "%Y-%m-%d %H:%M"
    )

    fim_dt = datetime.strptime(
        f"{data_fim} {hora_fim}",
        "%Y-%m-%d %H:%M"
    )

    conn = get_connection()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:

            query = """
            SELECT
                TO_CHAR(timestamp,'DD/MM/YYYY HH24:MI:SS') AS data_hora,
                metano,
                amonia

            FROM leituras_gas

            WHERE id_haste = %s
              AND timestamp BETWEEN %s AND %s

            ORDER BY timestamp;
            """

            cur.execute(
                query,
                (
                    haste_id,
                    inicio_dt,
                    fim_dt,
                ),
            )

            return cur.fetchall()

    finally:
        conn.close()


# GERAÇÃO DO PDF E ENVIO DO E-MAIL
def processar_e_enviar_relatorio(
    haste_id: int,
    data_inicio: str,
    data_fim: str,
    email_destino: str,
    hora_inicio: str = "00:00",
    hora_fim: str = "23:59",
):
    try:
        print(
            f"⚙️ Iniciando geração do relatório PDF para Haste #{haste_id}..."
        )

        if not WEASYPRINT_DISPONIVEL:
            print("❌ WeasyPrint não disponível neste ambiente Windows.")
            return

        # Busca os dados
        leituras_sensor1 = buscar_sensor1(
            haste_id, data_inicio, data_fim, hora_inicio, hora_fim
        )

        leituras_sensor2 = buscar_sensor2(
            haste_id, data_inicio, data_fim, hora_inicio, hora_fim
        )

        leituras_gas = buscar_gases(
            haste_id, data_inicio, data_fim, hora_inicio, hora_fim
        )

        html_template = """
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">

<style>

@page{
    size:A4 landscape;
    margin:12mm;
}

body{
    font-family:sans-serif;
    color:#1e293b;
}

.header{
    border-bottom:2px solid #2563eb;
    margin-bottom:20px;
    padding-bottom:8px;
}

h2{
    margin:0;
    color:#0f172a;
}

h3{
    margin-top:25px;
    margin-bottom:8px;
    color:#2563eb;
}

table{
    width:100%;
    border-collapse:collapse;
    margin-bottom:25px;
}

th{
    background:#f1f5f9;
    border:1px solid #cbd5e1;
    padding:6px;
    font-size:8pt;
}

td{
    border:1px solid #e2e8f0;
    padding:5px;
    text-align:center;
    font-size:8pt;
}

tr:nth-child(even){
    background:#f8fafc;
}

.empty{
    text-align:center;
    font-style:italic;
    color:#64748b;
}

</style>

</head>

<body>

<div class="header">

<h2>Bio Sense Flow - Relatório de Telemetria</h2>

<p>
<strong>Haste:</strong> {{ haste_id }}
<br>
<strong>Período:</strong>
{{ data_inicio }} {{ hora_inicio }}
até
{{ data_fim }} {{ hora_fim }}
</p>

</div>

<h3>Sensor NPK 1</h3>

<table>

<thead>

<tr>
<th>Data/Hora</th>
<th>Temp.</th>
<th>Umidade</th>
<th>Salinidade</th>
<th>SSD</th>
<th>N</th>
<th>P</th>
<th>K</th>
<th>EC</th>
<th>pH</th>
</tr>

</thead>

<tbody>

{% for item in leituras_sensor1 %}
<tr>
<td>{{ item.data_hora }}</td>
<td>{{ item.temperatura }}</td>
<td>{{ item.umidade }}</td>
<td>{{ item.salinidade }}</td>
<td>{{ item.ssd }}</td>
<td>{{ item.nitrogenio }}</td>
<td>{{ item.fosforo }}</td>
<td>{{ item.potassio }}</td>
<td>{{ item.condutividade }}</td>
<td>{{ item.ph }}</td>
</tr>
{% else %}
<tr>
<td colspan="10" class="empty">
Nenhuma leitura encontrada.
</td>
</tr>
{% endfor %}

</tbody>

</table>

<h3>Sensor NPK 2</h3>

<table>

<thead>

<tr>
<th>Data/Hora</th>
<th>Temp.</th>
<th>Umidade</th>
<th>Salinidade</th>
<th>SSD</th>
<th>N</th>
<th>P</th>
<th>K</th>
<th>EC</th>
<th>pH</th>
</tr>

</thead>

<tbody>

{% for item in leituras_sensor2 %}
<tr>
<td>{{ item.data_hora }}</td>
<td>{{ item.temperatura }}</td>
<td>{{ item.umidade }}</td>
<td>{{ item.salinidade }}</td>
<td>{{ item.ssd }}</td>
<td>{{ item.nitrogenio }}</td>
<td>{{ item.fosforo }}</td>
<td>{{ item.potassio }}</td>
<td>{{ item.condutividade }}</td>
<td>{{ item.ph }}</td>
</tr>
{% else %}
<tr>
<td colspan="10" class="empty">
Nenhuma leitura encontrada.
</td>
</tr>
{% endfor %}

</tbody>

</table>

<h3>Sensor de Gases</h3>

<table>

<thead>

<tr>
<th>Data/Hora</th>
<th>Metano</th>
<th>Amônia</th>
</tr>

</thead>

<tbody>

{% for item in leituras_gas %}
<tr>
<td>{{ item.data_hora }}</td>
<td>{{ item.metano }}</td>
<td>{{ item.amonia }}</td>
</tr>
{% else %}
<tr>
<td colspan="3" class="empty">
Nenhuma leitura encontrada.
</td>
</tr>
{% endfor %}

</tbody>

</table>

</body>
</html>
"""

        rendered_html = Template(html_template).render(
            haste_id=haste_id,
            data_inicio=data_inicio,
            data_fim=data_fim,
            hora_inicio=hora_inicio,
            hora_fim=hora_fim,
            leituras_sensor1=leituras_sensor1,
            leituras_sensor2=leituras_sensor2,
            leituras_gas=leituras_gas,
        )

        pdf_bytes = HTML(string=rendered_html).write_pdf()

        msg = MIMEMultipart()
        msg["Subject"] = (
            f"Relatório de Telemetria - Haste #{haste_id}"
        )
        msg["From"] = EMAIL_REMETENTE
        msg["To"] = email_destino

        corpo = f"""
Olá,

Segue em anexo o relatório de telemetria da haste {haste_id}.

O relatório contém:

• Leituras do Sensor NPK 1;
• Leituras do Sensor NPK 2;
• Leituras dos sensores de gases (Metano e Amônia).

Atenciosamente,
Equipe Bio Sense Flow
"""

        msg.attach(MIMEText(corpo, "plain"))

        anexo = MIMEApplication(
            pdf_bytes,
            Name=f"Relatorio_Haste_{haste_id}.pdf"
        )

        anexo["Content-Disposition"] = (
            f'attachment; filename="Relatorio_Haste_{haste_id}.pdf"'
        )

        msg.attach(anexo)

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_REMETENTE, SENHA_REMETENTE)
            server.send_message(msg)

        print(f"✅ E-mail enviado com sucesso para {email_destino}!")

    except Exception as e:
        print(f"❌ [ERRO NA TAREFA DE RELATÓRIO]: {e}")
        import traceback
        traceback.print_exc()

@app.post("/hastes/{haste_id}/relatorio-email")
def solicitar_relatorio(
    haste_id: int,
    data_inicio: str,
    data_fim: str,
    email: str,
    background_tasks: BackgroundTasks,
    hora_inicio: str = "00:00",
    hora_fim: str = "23:59",
):
    background_tasks.add_task(
        processar_e_enviar_relatorio,
        haste_id,
        data_inicio,
        data_fim,
        email,
        hora_inicio,
        hora_fim,
    )

    return {
        "status": "sucesso",
        "mensagem": (
            f"O relatório da haste {haste_id} "
            f"({data_inicio} {hora_inicio} até {data_fim} {hora_fim}) "
            f"está sendo gerado e será enviado para {email}."
        ),
    }