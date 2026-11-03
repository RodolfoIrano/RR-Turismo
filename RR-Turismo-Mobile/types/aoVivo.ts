// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Define o FORMATO dos dados da "Viagem ao vivo" (Modo Guia e
// Minha Viagem): participantes, avisos, emergências e o estado
// geral. Espelha o que o backend devolve em /api/ao-vivo/**.
// Só tipos - não roda nada.
// ============================================================

// Os 4 estados de um participante (iguais ao enum do backend).
export type StatusParticipante =
  | "COMPARTILHANDO"
  | "DISTANTE"
  | "SEM_LOCALIZACAO"
  | "ALERTA";

export interface ParticipanteAoVivo {
  usuarioId: number;
  nome: string;
  guia: boolean;
  status: StatusParticipante;
  distanciaM: number | null; // distância até o guia, em metros
  rumoGraus: number | null;  // direção a partir do guia (0 = Norte)
  segundosDesdeSinal: number | null;
  lat: number | null;
  lng: number | null;
}

export interface AvisoAoVivo {
  id: number;
  texto: string;
  tipo: "INFO" | "REUNIR";
  hora: number; // milissegundos desde 1970
}

export interface EmergenciaAoVivo {
  id: number;
  usuarioId: number;
  nome: string;
  mensagem: string;
  lat: number | null;
  lng: number | null;
  hora: number;
}

export interface EstadoAoVivo {
  ativa: boolean;
  souGuia: boolean;
  entrei: boolean;
  guiaNome: string | null;
  meuStatus: StatusParticipante | null;
  totalParticipantes: number;
  avisos: AvisoAoVivo[];
  emergencias: EmergenciaAoVivo[];
  participantes: ParticipanteAoVivo[]; // só o guia recebe a lista completa
}
