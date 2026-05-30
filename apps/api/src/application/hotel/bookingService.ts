import type { Quote, QuoteRepository } from "@/domain/hotel/booking";
import type { Money, Room } from "@/domain/hotel/hotel";

function daysBetween(fromIso: string, toIso: string) {
  const from = new Date(fromIso);
  const to = new Date(toIso);
  const diff = to.getTime() - from.getTime();
  const day = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.ceil(diff / day));
}

function money(amount: number): Money {
  return { currency: "IDR", amount };
}

function newId() {
  if ("crypto" in globalThis && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export class BookingService {
  constructor(private readonly quoteRepo: QuoteRepository) {}

  async createQuote(input: { room: Room; checkIn: string; checkOut: string; guests: number }): Promise<Quote> {
    if (!input.room) {
      throw new Error("room is required");
    }
    const nights = daysBetween(input.checkIn, input.checkOut);
    const subtotal = input.room.pricePerNight.amount * nights;
    const taxesAndFees = Math.round(subtotal * 0.12);
    const total = subtotal + taxesAndFees;

    const quote: Quote = {
      id: newId(),
      room: input.room,
      nights,
      subtotal: money(subtotal),
      taxesAndFees: money(taxesAndFees),
      total: money(total),
      createdAt: new Date().toISOString(),
    };

    await this.quoteRepo.save(quote);
    return quote;
  }
}

