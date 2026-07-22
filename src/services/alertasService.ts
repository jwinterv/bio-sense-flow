import { api } from "./api";
import type { Alerta, AlertStatus, Severity } from "@/types";

export interface AlertaFiltros {
  periodo?: "1h" | "6h" | "12h" | "24h" | "7d" | "30d" | "custom";

  inicio?: string;

  fim?: string;

  severidade?: Severity;

  status?: AlertStatus;

  hastes?: string[];
}

function converterGravidade(gravidade: number | string): Severity {
  const g = String(gravidade).toLowerCase();
  if (g === "1" || g === "baixa") return "baixa";
  if (g === "2" || g === "media" || g === "média") return "media";
  if (g === "3" || g === "alta") return "alta";
  if (g === "critica" || g === "crítica" || g === "4") return "critica";
  return "baixa";
}

export async function getAlertas(
  f: AlertaFiltros = {}
): Promise<Alerta[]> {

  const params = new URLSearchParams();

  if (f.periodo) params.append("periodo", f.periodo);
  if (f.inicio) params.append("inicio", f.inicio);
  if (f.fim) params.append("fim", f.fim);
  if (f.severidade) params.append("severidade", f.severidade);
  if (f.status) params.append("status", f.status);

  if (f.hastes && f.hastes.length > 0) {
    params.append("hastes", f.hastes.join(","));
  }

  const dados = await api
    .get<any[]>(`/alertas?${params.toString()}`)
    .catch(() => []);

  let list: Alerta[] = dados.map((a) => ({
    id: String(a.id),
    idErro: Number(a.idErro),
    origem: a.origem,
    data: a.data,
    hasteId: String(a.hasteId),
    tipo: a.tipo,
    severidade: converterGravidade(a.severidade),
    status: a.status as AlertStatus,
    mensagem: a.mensagem,
    instrucao: a.instrucao,
  }));

  return list;
}

export async function resolverAlerta(
  id: string,
  origem: string
) {

  const dados = await api.put(
    `/alertas/${id}/resolver?origem=${origem}`,
    null
  );

  return dados;

}