export type UserRole = "administrador" | "operador" | "visualizacao";
export type Severity = "baixa" | "media" | "alta" | "critica";
export type AlertStatus = "ativo" | "reconhecido" | "resolvido";
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

  coordenadaX: number;
  coordenadaY: number;

  dispositivo: {
    status: EntityStatus;
    temperatura: number | null;
    tensao: number | null;
    corrente: number | null;
    inclinacao: number | null;
    timestamp: string | null;
  };

  solo: {
    temperatura: number | null;
    umidade: number | null;
    salinidade: number | null;
    ssd: number | null;
    nitrogenio: number | null;
    fosforo: number | null;
    potassio: number | null;
    condutividade: number | null;
    ph: number | null;
    timestamp: string | null;
  };

  gas: {
    metano: number | null;
    amonia: number | null;
    timestamp: string | null;
  };

  status: EntityStatus;
  ultimaLeitura: string | null;
}

export interface HasteDetalhada {
  id: number;
  sensorSelecionado: number;

  nome: string;
  localizacao: string;
  coordenadaX: number;
  coordenadaY: number;

  dispositivo: {
    status: EntityStatus;
    temperatura: number | null;
    tensao: number | null;
    corrente: number | null;
    inclinacao: number | null;
    timestamp: string | null;
  };

  solo: {
    temperatura: number | null;
    umidade: number | null;
    salinidade: number | null;
    ssd: number | null;
    nitrogenio: number | null;
    fosforo: number | null;
    potassio: number | null;
    condutividade: number | null;
    ph: number | null;
    timestamp: string | null;
  };

  gas: {
    metano: number | null;
    amonia: number | null;
    timestamp: string | null;
  };
}

export interface Sensor {
    id: number;
    sensor: string;
    tipo: string;
    unidade: string;
    limiarInferior: number;
    limiarSuperior: number;
    operacaoMin: number;
    operacaoMax: number;
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
  idErro: number;
  data: string;
  origem: string;

  hasteId: string;

  tipo: string;

  severidade: Severity;

  status: AlertStatus;

  mensagem: string;

  instrucao: string;
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
