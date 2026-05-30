import type { PaymentAttempt, PaymentMethod, PaymentRepository, QuoteRepository } from "@/domain/hotel/booking";

function newId() {
  if ("crypto" in globalThis && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export class PaymentService {
  constructor(
    private readonly quoteRepo: QuoteRepository,
    private readonly paymentRepo: PaymentRepository,
  ) {}

  async pay(input: { quoteId: string; method: PaymentMethod; forceFail?: boolean }) {
    const quote = await this.quoteRepo.get(input.quoteId);
    if (!quote) {
      throw new Error("quote not found");
    }

    const shouldFail =
      input.forceFail === true || (input.method.type === "CARD" && input.method.last4 === "0000");

    const attempt: PaymentAttempt = {
      id: newId(),
      quoteId: input.quoteId,
      method: input.method,
      status: shouldFail ? "FAILED" : "SUCCESS",
      failureReason: shouldFail ? "payment_declined" : undefined,
      createdAt: new Date().toISOString(),
    };

    await this.paymentRepo.save(attempt);
    return { quote, attempt };
  }
}

