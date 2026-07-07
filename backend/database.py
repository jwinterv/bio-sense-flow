import psycopg2


def get_connection():
    return psycopg2.connect(
        host="localhost",
        port=5433,
        database="telemetria",
        user="telemetria_user",
        password="1234",
    )