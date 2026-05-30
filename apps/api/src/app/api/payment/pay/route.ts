import { NextResponse } from "next/server";
import { logApiInRequest, logApiInResponse, logException, withTags } from "@demo/sdk";
import { paymentProcessingService } from "@/lib/hotelContainer";
import type { PaymentMethod } from "@/domain/hotel/booking";

export async function POST(req: Request) {
  return withTags({ service: "be", endpoint: "/api/payment/pay" }, async () => {
    logApiInRequest({ method: "POST", endpoint: "/api/payment/pay" });
    const body = (await req.json()) as {
      quoteId?: string;
      method?: PaymentMethod;
      forceFail?: boolean;
    };

    const quoteId = body.quoteId ?? "";
    try {
      if (!body.method) {
        logApiInResponse({
          method: "POST",
          endpoint: "/api/payment/pay",
          status: 400,
          context: { quoteId, reason: "method_required" },
        });
        return NextResponse.json({ error: "method_required" }, { status: 400 });
      }
      const result = await paymentProcessingService().pay({ quoteId, method: body.method, forceFail: body.forceFail });
      const httpStatus = result.attempt.status === "SUCCESS" ? 200 : 402;
      logApiInResponse({
        method: "POST",
        endpoint: "/api/payment/pay",
        status: httpStatus,
        context: { quoteId, paymentStatus: result.attempt.status, failureReason: result.attempt.failureReason },
      });
      return NextResponse.json(result, { status: httpStatus });
    } catch (err) {
      logException(err, { action: "payment.pay", quoteId });
      logApiInResponse({ method: "POST", endpoint: "/api/payment/pay", status: 400, context: { quoteId } });
      return NextResponse.json({ error: "request_failed" }, { status: 400 });
    }
  });
}
