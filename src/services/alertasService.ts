import { mockDelay } from "./api";
import { mockAlertas } from "./mockData";
import type { Alerta, Severity } from "@/types";

export interface AlertaFiltros {
  periodo?: "24h" | "7d" | "30d";
  severidade?: Severity;
  hasteId?: string;
}

export function getAlertas(f: AlertaFiltros = {}): Promise<Alerta[]> {
  let list = [...mockAlertas];
  if (f.severidade) list = list.filter((a) => a.severidade === f.severidade);
  if (f.hasteId) list = list.filter((a) => a.hasteId === f.hasteId);
  return mockDelay(list);
}
