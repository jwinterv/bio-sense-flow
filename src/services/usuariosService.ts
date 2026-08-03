import { api } from "./api";
import type { Usuario } from "@/types";

export type UsuarioInput = Omit<Usuario, "id" | "ultimoAcesso"> & { senha?: string };

export const getUsuarios = () => api.get<Usuario[]>("/usuarios");

export const createUsuario = (data: UsuarioInput & { senha: string }) =>
  api.post<Usuario>("/usuarios", data);

export const updateUsuario = (id: string, data: Partial<UsuarioInput>) =>
  api.put<Usuario>(`/usuarios/${id}`, data);

export const deleteUsuario = (id: string) =>
  api.del<{ ok: boolean }>(`/usuarios/${id}`);
