// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Define o "FORMATO" de cada informação usada no app: o que é
// um Usuário, uma Viagem, um Guia, uma Reserva, um Cartão, etc
// (quais campos cada um tem, tipo nome/preço/data). É só pro
// TypeScript conferir se o código está usando os dados certo -
// não roda nada sozinho.
// ============================================================
// ============================================================
// MODELOS TYPESCRIPT DO RR TURISMO
// ------------------------------------------------------------
// Estas interfaces representam as futuras entidades do backend
// Spring Boot (User, Guide, Trip, Favorite, CartItem, Booking,
// Payment). Hoje elas tipam os dados mockados, mas devem
// permanecer iguais quando a API real for conectada - assim as
// telas não precisam ser refeitas.
// ============================================================

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  // Indica se o usuário já tem uma foto de perfil salva no
  // backend (a foto em si é carregada à parte, autenticada por
  // token - ver services/authService.ts -> fontePerfilFoto).
  temFoto?: boolean;
  // Mesma ideia, para o banner (imagem de capa/fundo do perfil).
  temBanner?: boolean;
  // Vem do campo Cadastro.guia do banco: libera o Modo Guia no app.
  guia?: boolean;
}

// ============================================================
// CARTÃO SALVO (item 1 da solicitação)
// ------------------------------------------------------------
// Representa um cartão já tokenizado e salvo no backend. NUNCA
// contém o número completo do cartão nem o CVV - apenas os
// dados necessários para exibir o cartão na lista (bandeira,
// últimos 4 dígitos, validade) e o token do gateway de
// pagamento, usado para cobrar sem reenviar o cartão inteiro.
// ============================================================
export interface SavedCard {
  id: string;
  gatewayToken: string;
  brand: string;
  lastDigits: string;
  printedName: string;
  expiry: string;
}

// Uma opção de parcelamento calculada para exibição no checkout.
export interface InstallmentOption {
  installments: number;
  installmentAmount: number;
  totalAmount: number;
  interestFree: boolean;
}

export interface Guide {
  id: string;
  name: string;
  photo: string;
  location: string;
  bio: string;
  experienceYears: number;
  languages: string[];
  specialties: string[];
  // Quantos clientes o guia já atendeu (vem do perfil do site).
  clientsServed?: number;
  // Redes de contato públicas do perfil do guia (podem vir vazias).
  contatos?: {
    whatsapp: string;
    instagram: string;
    facebook: string;
    twitter: string;
    site: string;
  };
  tripsCompleted: number;
  rating: number;
  reviewCount: number;
}

export interface Trip {
  id: string;
  title: string;
  description: string;
  destination: string;
  location: string; // cidade/estado
  category: string;
  price: number;
  duration: number; // em dias
  rating: number;
  reviewCount: number;
  guideId: string;
  images: string[];
  includedItems: string[];
  rules: string[];
  cancellationPolicy: string;
  available: boolean;
  // Dados cadastrados no site (campos que o criador preenche):
  dataIda?: string;      // "AAAA-MM-DD"
  dataVolta?: string;
  transporte?: string;
  hotel?: string;
  assentos?: number;     // total de vagas
  participantes?: number; // vagas já ocupadas
  featured?: boolean;
  onOffer?: boolean;
}

export interface Favorite {
  id: string;
  userId: string;
  tripId: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  tripId: string;
  quantity: number; // quantidade de pessoas
}

export type BookingStatus = "Confirmada" | "Pendente" | "Cancelada";

export interface Booking {
  id: string; // ex: RR20260001
  userId: string;
  tripId: string;
  guideId: string;
  people: number;
  date: string;        // quando a reserva foi FEITA (compra)
  dataIda?: string;    // quando a viagem ACONTECE (vem do site)
  dataVolta?: string;
  total: number;
  status: BookingStatus;
}

export interface Payment {
  id: string;
  bookingId: string;
  method: "credit_card" | "pix";
  amount: number;
  status: "approved" | "pending" | "failed";
}

export interface CheckoutCustomer {
  name: string;
  email: string;
  cpf: string;
  phone: string;
}

export interface CheckoutCard {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}
