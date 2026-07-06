import { mockDelay } from "./api";
import {
  mockAlertas,
  mockHastes,
  mockHistoricoTemp,
  mockHistoricoUmid,
  mockLeira,
} from "./mockData";
import type { DashboardResumo, MonitoramentoResumo, SeriePonto } from "@/types";

const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

export function getDashboard(): Promise<DashboardResumo> {
  const online = mockHastes.filter((h) => h.status === "online");
  const data: DashboardResumo = {
    temperaturaMedia: +avg(online.map((h) => h.temperatura)).toFixed(1),
    umidadeMedia: 61.4,
    phMedio: 6.8,
    npkMedio: 74,
    alertasAtivos: mockAlertas.filter((a) => a.status === "ativo").length,
    historicoTemperatura: mockHistoricoTemp,
    historicoUmidade: mockHistoricoUmid,
    ultimosAlertas: mockAlertas.slice(0, 4),
    hastes: mockHastes,
  };
  return mockDelay(data);
}

export function getMonitoramento(): Promise<MonitoramentoResumo> {
  const online = mockHastes.filter((h) => h.status === "online");
  return mockDelay({
    leira: mockLeira,
    temperaturaMedia: +avg(online.map((h) => h.temperatura)).toFixed(1),
    umidadeMedia: 61.4,
    phMedio: 6.8,
    npkMedio: 74,
    hastes: mockHastes,
    ultimaAtualizacao: new Date().toISOString(),
  });
}

export interface HistoricoFiltros {
  periodo?: "24h" | "7d" | "30d";
  sensor?: string;
  hasteId?: string;
}
export function getHistorico(_f: HistoricoFiltros = {}): Promise<{
  temperatura: SeriePonto[];
  umidade: SeriePonto[];
}> {
  return mockDelay({
    temperatura: mockHistoricoTemp,
    umidade: mockHistoricoUmid,
  });
}
