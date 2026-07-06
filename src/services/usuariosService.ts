import { mockDelay } from "./api";
import { mockUsuarios } from "./mockData";
import type { Usuario } from "@/types";

let usuarios = [...mockUsuarios];

export const getUsuarios = () => mockDelay(usuarios);
export const createUsuario = (u: Omit<Usuario, "id" | "ultimoAcesso">) => {
  const novo: Usuario = {
    ...u,
    id: `u-${Date.now()}`,
    ultimoAcesso: new Date().toISOString(),
  };
  usuarios = [...usuarios, novo];
  return mockDelay(novo);
};
export const updateUsuario = (id: string, u: Partial<Usuario>) => {
  usuarios = usuarios.map((x) => (x.id === id ? { ...x, ...u } : x));
  return mockDelay(usuarios.find((x) => x.id === id)!);
};
export const deleteUsuario = (id: string) => {
  usuarios = usuarios.filter((x) => x.id !== id);
  return mockDelay({ ok: true });
};
