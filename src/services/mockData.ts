import type {
  Alerta,
  Haste,
  Leira,
  Limites,
  Sensor,
  SeriePonto,
  Usuario,
} from "@/types";

export const mockLeira: Leira = {
  id: "leira-01",
  nome: "Leira 01 — Pátio Norte",
  comprimento: 40,
  largura: 4,
};

export const mockHastes: Haste[] = Array.from({ length: 8 }).map((_, i) => {
  const status = i === 5 ? "offline" : i === 3 ? "manutencao" : "online";
  return {
    id: `haste-${i + 1}`,
    leiraId: mockLeira.id,
    nome: `Haste ${String(i + 1).padStart(2, "0")}`,
    identificacao: `H-${1000 + i}`,
    coordenadaX: 2 + i * 4.5,
    coordenadaY: i % 2 === 0 ? 1 : 3,
    status,
    temperatura: 52 + Math.sin(i) * 6 + (i % 3),
    ultimaLeitura: new Date(Date.now() - i * 60_000).toISOString(),
  };
});

export const mockSensores: Sensor[] = mockHastes.flatMap((h, idx) => [
  {
    id: `${h.id}-temp`,
    hasteId: h.id,
    nome: `Temp ${h.identificacao}`,
    tipo: "temperatura",
    unidade: "°C",
    status: h.status,
    valorAtual: h.temperatura,
  },
  {
    id: `${h.id}-umid`,
    hasteId: h.id,
    nome: `Umid ${h.identificacao}`,
    tipo: "umidade",
    unidade: "%",
    status: h.status,
    valorAtual: 55 + (idx % 5) * 2,
  },
  {
    id: `${h.id}-ph`,
    hasteId: h.id,
    nome: `pH ${h.identificacao}`,
    tipo: "ph",
    unidade: "pH",
    status: h.status,
    valorAtual: 6.4 + (idx % 3) * 0.2,
  },
]);

export const mockLimites: Limites = {
  tempMax: 70,
  tempMin: 35,
  umidadeMax: 75,
  umidadeMin: 40,
  phMax: 8.5,
  phMin: 5.5,
};

export const mockAlertas: Alerta[] = [
  {
    id: "a1",
    data: new Date(Date.now() - 12 * 60_000).toISOString(),
    hasteId: "haste-6",
    hasteNome: "Haste 06",
    tipo: "Comunicação",
    severidade: "critica",
    status: "ativo",
    mensagem: "Sensor offline há mais de 10 minutos.",
  },
  {
    id: "a2",
    data: new Date(Date.now() - 45 * 60_000).toISOString(),
    hasteId: "haste-2",
    hasteNome: "Haste 02",
    tipo: "Temperatura",
    severidade: "alta",
    status: "ativo",
    mensagem: "Temperatura acima de 68°C.",
  },
  {
    id: "a3",
    data: new Date(Date.now() - 2 * 3600_000).toISOString(),
    hasteId: "haste-4",
    hasteNome: "Haste 04",
    tipo: "Manutenção",
    severidade: "media",
    status: "reconhecido",
    mensagem: "Haste em manutenção programada.",
  },
  {
    id: "a4",
    data: new Date(Date.now() - 5 * 3600_000).toISOString(),
    hasteId: "haste-1",
    hasteNome: "Haste 01",
    tipo: "Umidade",
    severidade: "baixa",
    status: "resolvido",
    mensagem: "Umidade abaixo de 42% — normalizada.",
  },
];

function serie(base: number, amp: number, n = 48): SeriePonto[] {
  const now = Date.now();
  return Array.from({ length: n }).map((_, i) => ({
    timestamp: new Date(now - (n - i) * 30 * 60_000).toISOString(),
    valor: +(base + Math.sin(i / 3) * amp + Math.random() * (amp / 3)).toFixed(2),
  }));
}

export const mockHistoricoTemp = serie(55, 6);
export const mockHistoricoUmid = serie(60, 8);

export const mockUsuarios: Usuario[] = [
  {
    id: "u1",
    nome: "Ana Rocha",
    email: "ana@planta.com",
    perfil: "administrador",
    ativo: true,
    ultimoAcesso: new Date().toISOString(),
  },
  {
    id: "u2",
    nome: "Carlos Mendes",
    email: "carlos@planta.com",
    perfil: "operador",
    ativo: true,
    ultimoAcesso: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: "u3",
    nome: "Sala de Controle",
    email: "sala@planta.com",
    perfil: "visualizacao",
    ativo: true,
    ultimoAcesso: new Date(Date.now() - 86400_000).toISOString(),
  },
];
