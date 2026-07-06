export type UserRole = "administrador" | "operador" | "visualizacao";
export type Severity = "baixa" | "media" | "alta" | "critica";
export type AlertStatus = "ativo" | "reconhecido" | "resolvido";
export type SensorType = "temperatura" | "umidade" | "ph" | "npk";
export type EntityStatus = "online" | "offline" | "manutencao";

export interface Leira {
  id: number;
  nome: string;
  comprimento: number; // metros
  largura: number; // metros
}

export interface Haste {
  id: string;
  leiraId: number;
  nome: string;
  identificacao: string;
  coordenadaX: number;
  coordenadaY: number;
  status: EntityStatus;
  temperatura: number;
  ultimaLeitura: string; // ISO date
}

export interface Sensor {
  id: string;
  hasteId: string;
  nome: string;
  tipo: SensorType;
  unidade: string;
  status: EntityStatus;
  valorAtual: number;
}

export interface Limites {
  tempMax: number;
  tempMin: number;
  umidadeMax: number;
  umidadeMin: number;
  phMax: number;
  phMin: number;
}

export interface Alerta {
  id: string;
  data: string;
  hasteId: string;
  hasteNome: string;
  tipo: string;
  severidade: Severity;
  status: AlertStatus;
  mensagem: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: UserRole;
  ativo: boolean;
  ultimoAcesso: string;
}

export interface SeriePonto {
  timestamp: string;
  valor: number;
}

export interface DashboardResumo {
  temperaturaMedia: number;
  temperaturaMax: number;
  umidadeMedia: number;
  alertasAtivos: number;
  ultimaLeitura: Date;
  historicoTemperatura: SeriePonto[];
  historicoUmidade: SeriePonto[];
  ultimosAlertas: Alerta[];
  hastes: Haste[];
}

export interface MonitoramentoResumo {
  leira: Leira;
  temperaturaMedia: number;
  umidadeMedia: number;
  phMedio: number;
  npkMedio: number;
  hastes: Haste[];
  ultimaAtualizacao: string;
}
