import { User } from "../types";

// ============================================================
// SEM USO ATUAL - substituído pelo login real
// ------------------------------------------------------------
// Este arquivo era usado antes de o app se conectar ao backend
// Spring. Hoje, "authService.ts" já faz login de verdade contra
// POST /api/auth/login (mesmo usuário/senha do site) - nada mais
// importa este arquivo.
// ============================================================
export const mockUser: User = {
  id: "u1",
  name: "Rafael Rodrigues",
  username: "rafael.rr",
  email: "rafael@email.com",
  phone: "(17) 99999-1234",
  avatar: "https://randomuser.me/api/portraits/men/12.jpg",
};
