import { mockDelay } from "./api";
import { mockLeira } from "./mockData";
import type { Leira } from "@/types";

const STORAGE_KEY = "bio-sense-flow:leiras";

function loadLeiras(): Leira[] {
  if (typeof window === "undefined") {
    return [mockLeira];
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : null;
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [mockLeira];
  } catch {
    return [mockLeira];
  }
}

function persistLeiras(nextLeiras: Leira[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLeiras));
  }
}

let leiras: Leira[] = loadLeiras();

export const getLeiras = () => mockDelay(leiras);
export const getLeira = (id: number) =>
  mockDelay(leiras.find((l) => l.id === id) ?? null);
export const updateLeira = (id: number, data: Partial<Leira>) => {
  leiras = leiras.map((l) => (l.id === id ? { ...l, ...data } : l));
  persistLeiras(leiras);
  return mockDelay(leiras.find((l) => l.id === id)!);
};
