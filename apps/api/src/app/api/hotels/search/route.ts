import { NextResponse } from "next/server";
import { logApiInRequest, logApiInResponse, logException, withTags } from "@demo/sdk";
import { hotelSearchService } from "@/lib/hotelContainer";

export async function GET(req: Request) {
  return withTags({ service: "be", endpoint: "/api/hotels/search" }, async () => {
    logApiInRequest({ method: "GET", endpoint: "/api/hotels/search" });
    const url = new URL(req.url);
    const city = url.searchParams.get("city") ?? "";
    const checkIn = url.searchParams.get("checkIn") ?? new Date().toISOString().slice(0, 10);
    const checkOut = url.searchParams.get("checkOut") ?? new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const guests = Number(url.searchParams.get("guests") ?? "2");

    try {
      const results = await hotelSearchService().search({ city, checkIn, checkOut, guests });
      logApiInResponse({ method: "GET", endpoint: "/api/hotels/search", status: 200, context: { count: results.length } });
      return NextResponse.json({ results });
    } catch (err) {
      logException(err, { action: "hotels.search" });
      const status = err instanceof Error ? 400 : 500;
      logApiInResponse({ method: "GET", endpoint: "/api/hotels/search", status });
      return NextResponse.json({ error: "request_failed" }, { status });
    }
  });
}
