import type { PaymentAttempt, PaymentRepository } from "@/domain/hotel/booking";

const store = new Map<string, PaymentAttempt[]>();

export class MemoryPaymentRepository implements PaymentRepository {
  async save(attempt: PaymentAttempt): Promise<void> {
    const prev = store.get(attempt.quoteId) ?? [];
    store.set(attempt.quoteId, [...prev, attempt]);
  }

  async listByQuoteId(quoteId: string): Promise<PaymentAttempt[]> {
    return store.get(quoteId) ?? [];
  }
}

