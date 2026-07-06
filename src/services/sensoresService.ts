import { mockDelay } from "./api";
import { mockLimites, mockSensores } from "./mockData";
import type { Limites, Sensor } from "@/types";

let sensores = [...mockSensores];
let limites = { ...mockLimites };

export const getSensores = () => mockDelay(sensores);
export const createSensor = (s: Omit<Sensor, "id">) => {
  const novo = { ...s, id: `sensor-${Date.now()}` };
  sensores = [...sensores, novo];
  return mockDelay(novo);
};
export const updateSensor = (id: string, s: Partial<Sensor>) => {
  sensores = sensores.map((x) => (x.id === id ? { ...x, ...s } : x));
  return mockDelay(sensores.find((x) => x.id === id)!);
};
export const deleteSensor = (id: string) => {
  sensores = sensores.filter((x) => x.id !== id);
  return mockDelay({ ok: true });
};

export const getLimites = () => mockDelay(limites);
export const updateLimites = (l: Limites) => {
  limites = { ...l };
  return mockDelay(limites);
};
