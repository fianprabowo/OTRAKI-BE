import { NextResponse } from "next/server";
import { logApiInRequest, logApiInResponse, logException, withTags } from "@demo/sdk";
import { quoteRepository } from "@/lib/hotelContainer";

export async function GET(_: Request, ctx: { params: Promise<{ quoteId: string }> }) {
  const { quoteId } = await ctx.params;
  return withTags({ service: "be", endpoint: "/api/booking/quote/[quoteId]" }, async () => {
    logApiInRequest({ method: "GET", endpoint: "/api/booking/quote/[quoteId]", context: { quoteId } });

    try {
      const quote = await quoteRepository().get(quoteId);
      if (!quote) {
        logApiInResponse({ method: "GET", endpoint: "/api/booking/quote/[quoteId]", status: 404, context: { quoteId } });
        return NextResponse.json({ error: "quote_not_found" }, { status: 404 });
      }
      logApiInResponse({
        method: "GET",
        endpoint: "/api/booking/quote/[quoteId]",
        status: 200,
        context: { quoteId, total: quote.total.amount },
      });
      return NextResponse.json({ quote });
    } catch (err) {
      logException(err, { action: "booking.quote.get", quoteId });
      logApiInResponse({ method: "GET", endpoint: "/api/booking/quote/[quoteId]", status: 500, context: { quoteId } });
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  });
}
