import { api } from "./api";

export interface ConfiguracaoAquisicao {
  intervaloMinutos: number;
  hardwareConectado: boolean;
  ultimaSolicitacaoManual: string | null;
}

export interface SolicitacaoLeituraManual {
  status: "pendente";
  mensagem: string;
  solicitadaEm: string;
}

export const getConfiguracaoAquisicao = () =>
  api.get<ConfiguracaoAquisicao>("/aquisicao/configuracao");

export const updateConfiguracaoAquisicao = (intervaloMinutos: number) =>
  api.put<ConfiguracaoAquisicao>("/aquisicao/configuracao", { intervaloMinutos });

export const solicitarLeituraManual = () =>
  api.post<SolicitacaoLeituraManual>("/aquisicao/leituras/manual", {});
