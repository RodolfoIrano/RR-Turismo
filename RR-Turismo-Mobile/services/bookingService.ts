// ============================================================
// 📄 O QUE ESTE ARQUIVO FAZ:
// Guarda e lista as RESERVAS que o usuário já fez (fica salvo
// no próprio celular, ver comentário completo mais abaixo).
// Usado pela tela "Minhas Reservas" e no fim do Checkout.
// ============================================================
import { Booking } from "../types";
import { delay } from "./api";
import { ArmazenamentoPorConta } from "./ArmazenamentoPorConta";

// ============================================================
// BOOKING SERVICE
// ------------------------------------------------------------
// As reservas confirmadas são salvas localmente para que a tela
// "Minhas Reservas" funcione de ponta a ponta sem backend.
// Futuramente:
//   GET  /api/bookings
//   POST /api/bookings
//   GET  /api/bookings/{id}
// ============================================================

// Cada conta tem a sua própria lista de reservas.
const gaveta = new ArmazenamentoPorConta<Booking>("reservas");

// Lista as reservas já feitas por esta conta, mais recente primeiro.
export async function getBookings(dono: string): Promise<Booking[]> {
  const bookings = await gaveta.ler(dono);
  return delay(bookings.reverse(), 200);
}

// Salva uma nova reserva confirmada (chamado depois do pagamento ser aprovado).
export async function createBooking(dono: string, booking: Booking): Promise<Booking> {
  const bookings = await gaveta.ler(dono);
  bookings.push(booking);
  await gaveta.gravar(dono, bookings);
  return delay(booking, 300);
}

// Gera um número de reserva sequencial no formato RR20260001
export async function generateBookingId(dono: string): Promise<string> {
  const bookings = await gaveta.ler(dono);
  const year = new Date().getFullYear();
  const sequence = String(bookings.length + 1).padStart(4, "0");
  return `RR${year}${sequence}`;
}
