import { mockDelay } from "./api";
import { mockLeira } from "./mockData";
import type { Leira } from "@/types";

let leiras: Leira[] = [mockLeira];

export const getLeiras = () => mockDelay(leiras);
export const getLeira = (id: string) =>
  mockDelay(leiras.find((l) => l.id === id) ?? null);
export const updateLeira = (id: string, data: Partial<Leira>) => {
  leiras = leiras.map((l) => (l.id === id ? { ...l, ...data } : l));
  return mockDelay(leiras.find((l) => l.id === id)!);
};
