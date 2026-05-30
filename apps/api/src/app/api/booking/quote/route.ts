import { NextResponse } from "next/server";
import { logApiInRequest, logApiInResponse, logException, withTags } from "@demo/sdk";
import { bookingQuoteService, hotelDetailService } from "@/lib/hotelContainer";

export async function POST(req: Request) {
  return withTags({ service: "be", endpoint: "/api/booking/quote" }, async () => {
    logApiInRequest({ method: "POST", endpoint: "/api/booking/quote" });
    const body = (await req.json()) as {
      hotelId?: string;
      roomId?: string;
      checkIn?: string;
      checkOut?: string;
      guests?: number;
    };

    const hotelId = body.hotelId ?? "";
    const roomId = body.roomId ?? "";
    const checkIn = body.checkIn ?? new Date().toISOString().slice(0, 10);
    const checkOut = body.checkOut ?? new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const guests = Number(body.guests ?? 2);

    try {
      const detail = await hotelDetailService().get(hotelId);
      const room = detail.rooms.find((r) => r.id === roomId);
      if (!room) {
        logApiInResponse({ method: "POST", endpoint: "/api/booking/quote", status: 404, context: { hotelId, roomId } });
        return NextResponse.json({ error: "room_not_found" }, { status: 404 });
      }

      const quote = await bookingQuoteService().createQuote({ room, checkIn, checkOut, guests });
      logApiInResponse({
        method: "POST",
        endpoint: "/api/booking/quote",
        status: 201,
        context: { quoteId: quote.id, total: quote.total.amount, hotelId, roomId },
      });
      return NextResponse.json({ quote }, { status: 201 });
    } catch (err) {
      logException(err, { action: "booking.quote" });
      logApiInResponse({ method: "POST", endpoint: "/api/booking/quote", status: 400, context: { hotelId, roomId } });
      return NextResponse.json({ error: "request_failed" }, { status: 400 });
    }
  });
}
