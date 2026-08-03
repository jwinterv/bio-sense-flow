import { api } from "./api";
import type { Usuario } from "@/types";

const SESSION_KEY = "bio-sense-flow:session";

export interface Sessao {
  token: string;
  usuario: Usuario;
}

export const getSessao = (): Sessao | null => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null") as Sessao | null;
  } catch {
    return null;
  }
};

export const salvarSessao = (sessao: Sessao) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessao));
};

export const limparSessao = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const login = async (email: string, senha: string) => {
  const sessao = await api.post<Sessao>("/auth/login", { email, senha });
  salvarSessao(sessao);
  return sessao;
};

export const getUsuarioAtual = () => api.get<Usuario>("/auth/me");
