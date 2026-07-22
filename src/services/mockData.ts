import type { Haste, Alerta, SeriePonto, Leira, Limites, Sensor, Usuario } from "@/types";

export const mockLeira: Leira = {
  id: 1,
  nome: "Leira Principal",
  comprimento: 50,
  largura: 5,
};

export const mockHastes: Haste[] = [
  {
    id: "1",
    leiraId: 1,
    nome: "Haste 1",
    coordenadaX: 1.2,
    coordenadaY: 2.3,
    status: "online",
    ultimaLeitura: new Date().toISOString(),
    temperatura: 25.5,
  },
  {
    id: "2",
    leiraId: 1,
    nome: "Haste 2",
    coordenadaX: 3.4,
    coordenadaY: 1.5,
    status: "online",
    ultimaLeitura: new Date().toISOString(),
    temperatura: 24.8,
  }
];

export const mockAlertas: Alerta[] = [
  {
    id: "a1",
    data: new Date().toISOString(),
    hasteId: "1",
    tipo: "Temperatura Alta",
    severidade: "alta",
    status: "ativo",
    mensagem: "Temperatura acima do limite na haste 1",
  }
];

export const mockHistoricoTemp: SeriePonto[] = [
  { timestamp: new Date(Date.now() - 3600000).toISOString(), valor: 25 },
  { timestamp: new Date().toISOString(), valor: 26 },
];

export const mockHistoricoUmid: SeriePonto[] = [
  { timestamp: new Date(Date.now() - 3600000).toISOString(), valor: 60 },
  { timestamp: new Date().toISOString(), valor: 61 },
];

export const mockLimites: Limites = {
  tempMax: 65,
  tempMin: 45,
  umidadeMax: 80,
  umidadeMin: 50,
  phMax: 8.5,
  phMin: 6.0,
};

export const mockSensores: Sensor[] = [
  {
    id: "s1",
    hasteId: "1",
    nome: "Sensor Temp Solo 1",
    tipo: "temperatura",
    unidade: "°C",
    status: "online",
    valorAtual: 25.5,
  }
];

export const mockUsuarios: Usuario[] = [
  {
    id: "u1",
    nome: "Julia",
    email: "julia@exemplo.com",
    perfil: "administrador",
    ativo: true,
    ultimoAcesso: new Date().toISOString(),
  }
];
