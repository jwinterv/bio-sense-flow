import { api } from "./api";
import type {
  DashboardResumo,
  Alerta,
  Severity,
  Haste,
} from "@/types";

function converterGravidade(gravidade: number): Severity {
  switch (gravidade) {
    case 1:
      return "baixa";
    case 2:
      return "media";
    case 3:
      return "alta";
    default:
      return "baixa";
  }
}

export interface HistoricoFiltros {
  hastes: string[];

  sensores: string[];

  sensorId: "1" | "2" | "ambos";

  periodo:
    | "1h"
    | "6h"
    | "12h"
    | "24h"
    | "7d"
    | "30d"
    | "custom";

  inicio?: string;
  fim?: string;
}

export interface HistoricoPonto {
  timestamp: string;
  valor: number;
}

export interface HistoricoSerie {
  nome: string;
  unidade: string;
  dados: HistoricoPonto[];
}

export interface HistoricoResponse {
  series: HistoricoSerie[];
}

export async function getHistorico(
  f: HistoricoFiltros = {
    periodo: "24h",
    sensores: ["temperatura", "umidade"],
    hastes: [],
    sensorId: "ambos",
  }
): Promise<HistoricoResponse> {


  const sensores = f.sensores.length > 0
    ? f.sensores
    : ["temperatura"];


  const params = new URLSearchParams();


  params.append(
    "sensores",
    sensores.join(",")
  );


  params.append(
    "periodo",
    f.periodo
  );

  if(f.periodo==="custom"){

    params.append(
      "inicio",
      f.inicio!
    );

    params.append(
      "fim",
      f.fim!
    );

    }


  if (f.hastes.length > 0) {
    params.append(
      "hastes",
      f.hastes.join(",")
    );
  }


  params.append(
    "sensorId",
    f.sensorId
  );


  const series = await api
    .get<HistoricoResponse>(
      `/historico?${params.toString()}`
    )
    .catch(() => ({
      series: [],
    }));


  return series;
}

function getUnidade(sensor: string): string {

  switch(sensor){

    case "temperatura":
      return "°C";

    case "umidade":
      return "%";

    case "ph":
      return "";

    case "metano":
    case "amonia":
      return "ppm";

    default:
      return "";
  }
}
export async function getAlertas(limite?: number): Promise<Alerta[]> {

  const url = limite
    ? `/alertas?limite=${limite}`
    : "/alertas";

  const dados = await api.get<{
    id: string;
    origem: string;
    data: string;
    hasteId: string;
    tipo: string;
    severidade: number;
    status: string;
    mensagem: string;
    instrucao: string;
  }[]>(url);

  return dados.map((a) => ({
    id: a.id,
    origem: a.origem,
    data: a.data,
    hasteId: a.hasteId,
    tipo: a.tipo,
    severidade: converterGravidade(a.severidade),
    status: a.status as "ativo" | "resolvido",
    mensagem: a.mensagem,
    instrucao: a.instrucao,
  }));
}

export async function getHastes(): Promise<Haste[]> {
  return api.get<Haste[]>("/hastes");
}

export async function getDashboard(): Promise<DashboardResumo> {

  const [dashboard, historico, alertas, hastes] = await Promise.all([
    api.get<{
      temperaturaMedia: number;
      temperaturaMax: number;
      umidadeMedia: number;
      alertasAtivos: number;
    }>("/dashboard"),

    getHistorico(),

    getAlertas(),

    getHastes(),
  ]);

  return {
    temperaturaMedia: dashboard.temperaturaMedia,
    temperaturaMax: dashboard.temperaturaMax,
    umidadeMedia: dashboard.umidadeMedia,
    ultimaLeitura: new Date(),
    alertasAtivos: dashboard.alertasAtivos,

    historicoTemperatura:
      historico.series.find(
        (s) => s.nome === "temperatura"
      )?.dados ?? [],

    historicoUmidade:
      historico.series.find(
        (s) => s.nome === "umidade"
      )?.dados ?? [],

    ultimosAlertas: alertas,
    hastes,
  };

}