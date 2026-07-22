import { mockDelay } from "./api";
import { mockLeira } from "./mockData";
import type { Leira } from "@/types";

let leiras: Leira[] = [mockLeira];

export const getLeiras = () => mockDelay(leiras);
export const getLeira = (id: number) =>
  mockDelay(leiras.find((l) => l.id === id) ?? null);
export const updateLeira = (id: number, data: Partial<Leira>) => {
  leiras = leiras.map((l) => (l.id === id ? { ...l, ...data } : l));
  return mockDelay(leiras.find((l) => l.id === id)!);
};
