import { mockDelay } from "./api";
import { mockHastes } from "./mockData";
import type { Haste } from "@/types";

let hastes = [...mockHastes];

export const getHastes = () => mockDelay(hastes);
export const getHaste = (id: string) =>
  mockDelay(hastes.find((h) => h.id === id) ?? null);

export const createHaste = (data: Omit<Haste, "id">) => {
  const nova: Haste = { ...data, id: `haste-${Date.now()}` };
  hastes = [...hastes, nova];
  return mockDelay(nova);
};

export const updateHaste = (id: string, data: Partial<Haste>) => {
  hastes = hastes.map((h) => (h.id === id ? { ...h, ...data } : h));
  return mockDelay(hastes.find((h) => h.id === id)!);
};

export const deleteHaste = (id: string) => {
  hastes = hastes.filter((h) => h.id !== id);
  return mockDelay({ ok: true });
};
