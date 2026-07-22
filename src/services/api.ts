/**
 * Camada base de API REST.
 * Preparado para futuramente apontar para o backend real
 * rodando no Raspberry Pi (ex.: http://raspi.local:8000/api).
 */


export const API_BASE_URL =
  (typeof import.meta !== "undefined" && (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL) ||
  "http://127.0.0.1:8000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
      signal: controller.signal,
      ...init,
    });

    if (!res.ok) {
      throw new ApiError(res.status, await res.text());
    }

    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(504, "Tempo limite ao acessar a API");
    }

    throw error;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

/** Simula latência de rede quando usando mocks. */
export const mockDelay = <T>(data: T, ms = 300): Promise<T> =>
  new Promise((r) => setTimeout(() => r(data), ms));
