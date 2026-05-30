import type { Money, Room } from "@/domain/hotel/hotel";

export type QuoteRequest = {
  room: Room;
  checkIn: string;
  checkOut: string;
  guests: number;
};

export type Quote = {
  id: string;
  room: Room;
  nights: number;
  subtotal: Money;
  taxesAndFees: Money;
  total: Money;
  createdAt: string;
};

export type PaymentMethod =
  | { type: "VIRTUAL_ACCOUNT"; provider: "BCA" | "BNI" | "MANDIRI" }
  | { type: "EWALLET"; provider: "OVO" | "DANA" | "GOPAY" }
  | { type: "CARD"; last4: string };

export type PaymentAttempt = {
  id: string;
  quoteId: string;
  method: PaymentMethod;
  status: "SUCCESS" | "FAILED";
  failureReason?: string;
  createdAt: string;
};

export interface QuoteRepository {
  save(quote: Quote): Promise<void>;
  get(quoteId: string): Promise<Quote | null>;
}

export interface PaymentRepository {
  save(attempt: PaymentAttempt): Promise<void>;
  listByQuoteId(quoteId: string): Promise<PaymentAttempt[]>;
}

