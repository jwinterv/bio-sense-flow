import { api } from "./api";
import type { Haste } from "@/types";

export const getHastes = () =>
  api.get<Haste[]>("/hastes");

// Vamos implementar estes depois
export const getHaste = async (_id: string) => {
  throw new Error("Não implementado");
};

export const createHaste = (data: Omit<Haste, "id">) =>
  api.post<Haste>("/hastes", data);

export const updateHaste = (
  id: string,
  data: Partial<Haste>
) =>
  api.put<Haste>(`/hastes/${id}`, data);

export const deleteHaste = (id: string) =>
  api.del<{ ok: boolean }>(`/hastes/${id}`);