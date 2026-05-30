import { NextResponse } from "next/server";
import { logApiInRequest, logApiInResponse, logException, withTags } from "@demo/sdk";
import { hotelDetailService } from "@/lib/hotelContainer";

export async function GET(_: Request, ctx: { params: Promise<{ hotelId: string }> }) {
  const { hotelId } = await ctx.params;
  return withTags({ service: "be", endpoint: "/api/hotels/[hotelId]" }, async () => {
    logApiInRequest({ method: "GET", endpoint: "/api/hotels/[hotelId]", context: { hotelId } });

    try {
      const detail = await hotelDetailService().get(hotelId);
      logApiInResponse({
        method: "GET",
        endpoint: "/api/hotels/[hotelId]",
        status: 200,
        context: { hotelId, roomCount: detail.rooms.length },
      });
      return NextResponse.json(detail);
    } catch (err) {
      logException(err, { action: "hotels.detail", hotelId });
      const status = err instanceof Error && err.message.includes("not found") ? 404 : 400;
      logApiInResponse({ method: "GET", endpoint: "/api/hotels/[hotelId]", status, context: { hotelId } });
      return NextResponse.json({ error: "request_failed" }, { status });
    }
  });
}
