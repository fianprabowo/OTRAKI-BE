"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { logEvent, logException } from "@demo/sdk";
import { apiFetch } from "@/lib/api";
import { formatIdr } from "@/lib/format";

type Money = { currency: "IDR"; amount: number };

type Hotel = {
  id: string;
  name: string;
  city: string;
  address: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  amenities: string[];
};

type Room = {
  id: string;
  hotelId: string;
  name: string;
  refundable: boolean;
  breakfastIncluded: boolean;
  pricePerNight: Money;
};

export default function PdpPage() {
  const router = useRouter();
  const params = useParams<{ hotelId: string }>();
  const sp = useSearchParams();
  const hotelId = params.hotelId;
  const [loading, setLoading] = useState(true);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState("");

  const checkIn = sp.get("checkIn") ?? new Date().toISOString().slice(0, 10);
  const checkOut = sp.get("checkOut") ?? new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const guests = Number(sp.get("guests") ?? "2");

  const apiBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001",
    [],
  );

  useEffect(() => {
    logEvent("fe.pdp.view", { hotelId, checkIn, checkOut, guests });
  }, [hotelId, checkIn, checkOut, guests]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<{ hotel: Hotel; rooms: Room[] }>(`/api/hotels/${hotelId}`, {
        requestName: "Hotel Detail",
      });
      setHotel(data.hotel);
      setRooms(data.rooms);
      logEvent("fe.pdp.load.success", { hotelId, roomCount: data.rooms.length });
    } catch (err) {
      logException(err, { where: "PdpPage.load", hotelId });
      setError("Failed to load hotel detail. Check Sentry.");
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  async function selectRoom(roomId: string) {
    try {
      logEvent("fe.pdp.room.select.clicked", { hotelId, roomId });
      const data = await apiFetch<{ quote: { id: string } }>("/api/booking/quote", {
        method: "POST",
        body: JSON.stringify({ hotelId, roomId, checkIn, checkOut, guests }),
        requestName: "Create Quote",
      });
      router.push(`/payment?quoteId=${encodeURIComponent(data.quote.id)}`);
    } catch (err) {
      logException(err, { where: "PdpPage.selectRoom", hotelId, roomId });
      setError("Failed to create quote. Check Sentry.");
    }
  }

  useEffect(() => {
    void load();
  }, [load]);

  const cardClass = "rounded-2xl border border-brand-100/70 bg-white/85 shadow-sm backdrop-blur";
  const cardInnerClass = "p-5 sm:p-6";
  const badgeClass =
    "inline-flex items-center gap-1.5 rounded-full border border-brand-200/70 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800";

  if (loading) {
    return (
      <div className={cardClass}>
        <div className={`${cardInnerClass} text-sm font-semibold text-slate-600`}>Loading PDP...</div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className={cardClass}>
        <div className={cardInnerClass}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900">Hotel not found</h1>
              <div className="mt-1 text-sm font-semibold text-slate-600">Try another item from SRP.</div>
            </div>
            <Link className="btn-ghost" href="/hotels" onClick={() => logEvent("fe.pdp.back_to_srp.clicked", { hotelId })}>
              Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr,0.9fr]">
      <section className={cardClass}>
        <div className={cardInnerClass}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900">Property Detail</h1>
              <div className="mt-1 text-sm font-semibold text-slate-600">
                {hotel.city} • {checkIn} → {checkOut} • {guests} guest(s)
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                className="btn-ghost"
                href={`${apiBaseUrl}/api/hotels/${hotelId}`}
                target="_blank"
                onClick={() => logEvent("fe.pdp.open_api.clicked", { hotelId })}
              >
                Open API
              </a>
              <Link className="btn-ghost" href="/hotels" onClick={() => logEvent("fe.pdp.back_to_srp.clicked", { hotelId })}>
                Back to SRP
              </Link>
              <span className="inline-flex items-center rounded-full border border-sun-200 bg-sun-50 px-3 py-1 text-xs font-semibold text-sun-900">
                PDP
              </span>
            </div>
          </div>

          {error ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              {error}
            </div>
          ) : null}

          <div className="mt-5 h-px w-full bg-brand-100" />

          <div className="mt-5 grid grid-cols-1 gap-4 rounded-2xl border border-brand-100 bg-white/90 p-4 shadow-sm sm:grid-cols-[220px,1fr]">
            <div className="relative h-48 w-full overflow-hidden rounded-2xl ring-1 ring-brand-100 sm:h-[160px]">
              <Image src={hotel.imageUrl} alt={hotel.name} fill sizes="220px" className="object-cover" priority={false} />
            </div>
            <div className="flex flex-col justify-between gap-4 sm:flex-row">
              <div className="min-w-0">
                <p className="text-lg font-black tracking-tight text-slate-900">{hotel.name}</p>
                <p className="mt-1 text-sm text-slate-600">{hotel.address}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={badgeClass}>⭐ {hotel.rating.toFixed(1)}</span>
                  <span className={badgeClass}>{hotel.reviewCount} reviews</span>
                  <span className={badgeClass}>{hotel.amenities.slice(0, 4).join(" • ")}</span>
                </div>
              </div>
              <div className="flex items-start justify-end">
                <span className="inline-flex items-center rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                  mock data
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 h-px w-full bg-brand-100" />

          <div className="mt-5 text-sm font-extrabold text-slate-900">Rooms</div>
          <div className="mt-3 grid grid-cols-1 gap-4">
            {rooms.map((r) => (
              <div key={r.id} className="grid grid-cols-1 gap-4 rounded-2xl border border-brand-100 bg-white/90 p-4 shadow-sm sm:grid-cols-[220px,1fr]">
                <div className="flex flex-wrap items-start gap-2">
                  <span className={badgeClass}>{r.refundable ? "Refundable" : "Non-refundable"}</span>
                  <span className={badgeClass}>{r.breakfastIncluded ? "Breakfast included" : "No breakfast"}</span>
                </div>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div className="min-w-0">
                    <p className="text-base font-extrabold text-slate-900">{r.name}</p>
                    <p className="mt-1 text-sm text-slate-600">Pay per night • IDR</p>
                  </div>
                  <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4 text-right sm:min-w-[240px]">
                    <div className="text-lg font-black tracking-tight text-slate-900">{formatIdr(r.pricePerNight.amount)}</div>
                    <div className="text-xs font-semibold text-slate-600">/night</div>
                    <div className="mt-3">
                      <button className="btn-primary" onClick={() => void selectRoom(r.id)}>
                        Book this room
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className={cardClass}>
        <div className={cardInnerClass}>
          <div className="text-sm font-extrabold text-slate-900">What gets logged</div>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <div>Open PDP → fe.pdp.view</div>
            <div>Load detail → fe.request.* + be.hotels.detail.*</div>
            <div>Select room → fe.request.* + be.booking.quote.*</div>
          </div>
        </div>
      </aside>
    </div>
  );
}
