from datetime import datetime, timezone


# TODO(raspberry): substituir este armazenamento em memoria por configuracao
# persistente e publicar o intervalo para o processo de coleta do Raspberry Pi.
configuracao_aquisicao = {
    "intervaloMinutos": 60,
    "hardwareConectado": False,
    "ultimaSolicitacaoManual": None,
}


def get_configuracao_aquisicao():
    return configuracao_aquisicao


def update_configuracao_aquisicao(intervalo_minutos: int):
    configuracao_aquisicao["intervaloMinutos"] = intervalo_minutos
    return configuracao_aquisicao


def solicitar_leitura_manual():
    solicitado_em = datetime.now(timezone.utc).isoformat()
    configuracao_aquisicao["ultimaSolicitacaoManual"] = solicitado_em

    # TODO(raspberry): enviar o comando para o worker de leitura e trocar o
    # status para "executando" ou "concluida" conforme a resposta do hardware.
    return {
        "status": "pendente",
        "mensagem": "Solicitacao registrada. A integracao com o Raspberry Pi ainda nao esta ativa.",
        "solicitadaEm": solicitado_em,
    }
