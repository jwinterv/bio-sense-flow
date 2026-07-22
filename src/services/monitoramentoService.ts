import { api } from "./api";
import type { HasteDetalhada } from "@/types";
import type { Haste } from "@/types";

export async function getHaste(
  id: number,
  sensor: number
): Promise<HasteDetalhada> {
  return api.get<HasteDetalhada>(`/hastes/${id}?sensor=${sensor}`);
}

export async function getHastesMonitoramento(): Promise<Haste[]> {
  return api.get<Haste[]>("/monitoramento/hastes");
}
