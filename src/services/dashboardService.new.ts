import { api, mockDelay } from "./api";
import {
  mockAlertas,
  mockHastes,
  mockHistoricoTemp,
  mockHistoricoUmid,
  mockLeira,
} from "./mockData";
import type {
  DashboardResumo,
  MonitoramentoResumo,
  SeriePonto,
  Alerta,
} from "@/types";

const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

function buildMockDashboard(
  historicoData: { temperatura: SeriePonto[]; umidade: SeriePonto[] } = {
    temperatura: mockHistoricoTemp,
    umidade: mockHistoricoUmid,
  },
  alertasData: Alerta[] = mockAlertas,
): DashboardResumo {
  const online = mockHastes.filter((h) => h.status === "online");
  const temperaturasOnline = online.map((h) => h.temperatura).filter((t): t is number => t !== undefined);

  return {
    temperaturaMedia: +avg(temperaturasOnline).toFixed(1),
    temperaturaMax:
      temperaturasOnline.length > 0 ? +Math.max(...temperaturasOnline).toFixed(1) : 0,
    umidadeMedia: 61.4,
    ultimaLeitura: new Date(),
    alertasAtivos: alertasData.filter((a) => a.status === "ativo").length,
    historicoTemperatura: historicoData.temperatura,
    historicoUmidade: historicoData.umidade,
    ultimosAlertas: alertasData,
    hastes: mockHastes,
  };
}

export async function getDashboard(): Promise<DashboardResumo> {
  try {
    const [dados, historicoData, alertasData] = await Promise.all([
      api.get<{
        temperaturaMedia: number;
        temperaturaMax: number;
        umidadeMedia: number;
        alertasAtivos: number;
      }>('/dashboard').catch(() => null),
      getHistorico().catch(() => ({
        temperatura: mockHistoricoTemp,
        umidade: mockHistoricoUmid,
      })),
      getAlertas().catch(() => mockAlertas),
    ]);

    const resolvedAlertas =
      Array.isArray(alertasData) && alertasData.length > 0 ? alertasData : mockAlertas;
    const resolvedHistorico = historicoData ?? {
      temperatura: mockHistoricoTemp,
      umidade: mockHistoricoUmid,
    };

    if (!dados) {
      return buildMockDashboard(resolvedHistorico, resolvedAlertas);
    }

    return {
      temperaturaMedia: +dados.temperaturaMedia.toFixed(1),
      temperaturaMax: +dados.temperaturaMax.toFixed(1),
      umidadeMedia: +dados.umidadeMedia.toFixed(1),
      ultimaLeitura: new Date(),
      alertasAtivos: dados.alertasAtivos,
      historicoTemperatura: resolvedHistorico.temperatura,
      historicoUmidade: resolvedHistorico.umidade,
      ultimosAlertas: resolvedAlertas,
      hastes: mockHastes,
    };
  } catch (error) {
    console.warn('Falha ao carregar dados do backend, usando fallback mock.', error);
    return buildMockDashboard();
  }
}

export function getMonitoramento(): Promise<MonitoramentoResumo> {
  const online = mockHastes.filter((h) => h.status === 'online');
  return mockDelay({
    leira: mockLeira,
    temperaturaMedia: +avg(online.map((h) => h.temperatura).filter((t): t is number => t !== undefined)).toFixed(1),
    umidadeMedia: 61.4,
    phMedio: 6.8,
    npkMedio: 74,
    hastes: mockHastes,
    ultimaAtualizacao: new Date().toISOString(),
  });
}

export interface HistoricoFiltros {
  periodo?: '24h' | '7d' | '30d';
  sensor?: string;
  hasteId?: string;
}

export async function getHistorico(_f: HistoricoFiltros = {}) {
  const temperatura = await api
    .get<{ timestamp: string; valor: number }[]>('/historico/temperatura?horas=24')
    .catch(() => []);

  const umidade = await api
    .get<{ timestamp: string; valor: number }[]>('/historico/umidade?horas=24')
    .catch(() => []);

  return {
    temperatura: temperatura.map((item) => ({
      timestamp: item.timestamp,
      valor: item.valor,
    })),

    umidade: umidade.map((item) => ({
      timestamp: item.timestamp,
      valor: item.valor,
    })),
  };
}

export async function getAlertas(): Promise<Alerta[]> {
  return api.get<Alerta[]>('/alertas').catch(() => mockAlertas);
}
