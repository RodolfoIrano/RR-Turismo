import { Guide } from "../types";

// ============================================================
// SEM USO ATUAL - dados fictícios substituídos pela API real
// ------------------------------------------------------------
// Este arquivo era usado antes de o app se conectar ao backend
// Spring. Hoje, "guideService.ts" já busca os guias de verdade
// (GET /api/guias/{id}, que são os criadores das viagens no
// site) - nada mais importa este arquivo.
// ============================================================
export const guidesMock: Guide[] = [
  {
    id: "g1",
    name: "João Silva",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    location: "Rio de Janeiro, RJ",
    bio: "Guia local há mais de 10 anos, apaixonado por trilhas e cachoeiras. Formado em Turismo pela UFRJ.",
    experienceYears: 10,
    languages: ["Português", "Inglês", "Espanhol"],
    specialties: ["Trilhas", "Ecoturismo", "Fotografia de viagem"],
    tripsCompleted: 340,
    rating: 4.9,
    reviewCount: 128,
  },
  {
    id: "g2",
    name: "Marina Costa",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    location: "Foz do Iguaçu, PR",
    bio: "Especialista em turismo de aventura e cataratas. Já acompanhou mais de 500 visitantes internacionais.",
    experienceYears: 7,
    languages: ["Português", "Inglês"],
    specialties: ["Aventura", "Turismo de natureza"],
    tripsCompleted: 210,
    rating: 4.8,
    reviewCount: 96,
  },
  {
    id: "g3",
    name: "Carlos Mendes",
    photo: "https://randomuser.me/api/portraits/men/65.jpg",
    location: "Bonito, MS",
    bio: "Guia certificado em mergulho e flutuação. Conhece cada rio e gruta da região de Bonito.",
    experienceYears: 12,
    languages: ["Português", "Inglês"],
    specialties: ["Mergulho", "Flutuação", "Espeleologia"],
    tripsCompleted: 480,
    rating: 5.0,
    reviewCount: 203,
  },
  {
    id: "g4",
    name: "Ana Paula Ferreira",
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    location: "Jericoacoara, CE",
    bio: "Nascida no Ceará, mostra o litoral nordestino com autenticidade e histórias locais.",
    experienceYears: 6,
    languages: ["Português", "Inglês", "Francês"],
    specialties: ["Praias", "Passeios de buggy", "Cultura local"],
    tripsCompleted: 175,
    rating: 4.7,
    reviewCount: 84,
  },
];
