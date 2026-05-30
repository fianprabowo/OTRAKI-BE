import type { Quote, QuoteRepository } from "@/domain/hotel/booking";

const store = new Map<string, Quote>();

export class MemoryQuoteRepository implements QuoteRepository {
  async save(quote: Quote): Promise<void> {
    store.set(quote.id, quote);
  }

  async get(quoteId: string): Promise<Quote | null> {
    return store.get(quoteId) ?? null;
  }
}

