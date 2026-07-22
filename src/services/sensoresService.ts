import { api } from "./api";
import type { Sensor } from "@/types"

export const getSensores = () =>
  api.get<Sensor[]>("/sensores");

export const updateSensor = (
  id: number,
  data: Omit<Sensor, "id" | "sensor" | "tipo" | "unidade">
) =>
  api.put(`/sensores/${id}`, data);