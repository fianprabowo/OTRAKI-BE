"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { logEvent, logException } from "@demo/sdk";
import { apiFetch } from "@/lib/api";
import { addDaysIso } from "@/lib/date";
import BookingWidget from "./_components/BookingWidget";
import HotelCard from "./_components/HotelCard";
import { HotelCardSkeleton } from "./_components/Skeletons";

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

type SearchResult = {
  hotel: Hotel;
  lowestPricePerNight: Money;
};

export default function SrpPage() {
  const initialQuery = useMemo(
    () => ({
      city: "Jakarta",
      checkIn: addDaysIso(3),
      checkOut: addDaysIso(4),
      guests: 2,
    }),
    [],
  );

  const [city, setCity] = useState(initialQuery.city);
  const [checkIn, setCheckIn] = useState(initialQuery.checkIn);
  const [checkOut, setCheckOut] = useState(initialQuery.checkOut);
  const [guests, setGuests] = useState(initialQuery.guests);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string>("");
  const [showStickySearch, setShowStickySearch] = useState(false);
  const heroSentinelRef = useRef<HTMLDivElement | null>(null);
  const apiBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001",
    [],
  );

  useEffect(() => {
    logEvent("fe.srp.view", { apiBaseUrl });
  }, [apiBaseUrl]);

  const search = useCallback(async (q: { city: string; checkIn: string; checkOut: string; guests: number }) => {
    setLoading(true);
    setError("");

    try {
      logEvent("fe.srp.search.clicked", q);
      const qs = new URLSearchParams({
        city: q.city,
        checkIn: q.checkIn,
        checkOut: q.checkOut,
        guests: String(q.guests),
      }).toString();
      const data = await apiFetch<{ results: SearchResult[] }>(`/api/hotels/search?${qs}`, {
        requestName: "Hotels Search",
      });
      setResults(data.results);
      logEvent("fe.srp.search.success", { count: data.results.length });
    } catch (err) {
      logException(err, { where: "SrpPage.search" });
      setError("Search failed. Check Sentry for details.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void search(initialQuery);
  }, [initialQuery, search]);

  useEffect(() => {
    const el = heroSentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        setShowStickySearch(!entries[0]?.isIntersecting);
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const heroImage =
    "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20resort%20overlooking%20ocean%2C%20tropical%20Bali%20sunset%2C%20modern%20architecture%2C%20premium%20travel%20photography%2C%20soft%20pastel%20blue%20tones%2C%20high%20detail%2C%2016%3A9&image_size=landscape_16_9";

  return (
    <div className="relative">
      {showStickySearch ? (
        <div className="fixed inset-x-0 top-[72px] z-20 px-4">
          <div className="mx-auto max-w-[1280px]">
            <BookingWidget
              variant="sticky"
              city={city}
              checkIn={checkIn}
              checkOut={checkOut}
              guests={guests}
              loading={loading}
              onCityChange={setCity}
              onCheckInChange={setCheckIn}
              onCheckOutChange={setCheckOut}
              onGuestsChange={setGuests}
              onSearch={() => void search({ city, checkIn, checkOut, guests })}
            />
          </div>
        </div>
      ) : null}

      <section className="relative overflow-hidden rounded-[28px] border border-slate-200/60 bg-slate-900">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/40 to-slate-950/75" />

        <div className="relative px-6 py-12 sm:px-10 sm:py-16">
          <div className="mx-auto max-w-[1280px]">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur">
                Trusted stays in Indonesia
                <span className="h-1.5 w-1.5 rounded-full bg-brand-300" />
                Secure booking
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Find your perfect stay in seconds
              </h1>
              <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">
                Compare hand-picked hotels, transparent pricing, and flexible stays across Jakarta, Bandung, and Bali.
              </p>
            </div>

            <div className="mt-10">
              <BookingWidget
                variant="hero"
                city={city}
                checkIn={checkIn}
                checkOut={checkOut}
                guests={guests}
                loading={loading}
                onCityChange={setCity}
                onCheckInChange={setCheckIn}
                onCheckOutChange={setCheckOut}
                onGuestsChange={setGuests}
                onSearch={() => void search({ city, checkIn, checkOut, guests })}
              />
            </div>
          </div>
        </div>
        <div ref={heroSentinelRef} className="absolute bottom-0 left-0 right-0 h-px" />
      </section>

      <section className={`mx-auto mt-10 max-w-[1280px] px-4 ${showStickySearch ? "pt-24" : ""}`}>
        {error ? (
          <div className="rounded-[20px] border border-red-200/80 bg-red-50 px-5 py-4 text-sm font-semibold text-red-800 shadow-sm">
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-500">Results</div>
                <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Popular stays</div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                {loading ? "Searching…" : `${results.length} stays`}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {loading ? (
                <>
                  <HotelCardSkeleton />
                  <HotelCardSkeleton />
                  <HotelCardSkeleton />
                  <HotelCardSkeleton />
                </>
              ) : (
                results.map((r) => (
                  <HotelCard
                    key={r.hotel.id}
                    result={r}
                    priceLabel="From"
                    href={`/hotels/${r.hotel.id}?city=${encodeURIComponent(city)}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&guests=${encodeURIComponent(String(guests))}`}
                    onOpen={() => logEvent("fe.srp.open_pdp.clicked", { hotelId: r.hotel.id })}
                  />
                ))
              )}
            </div>

            {!loading && results.length === 0 ? (
              <div className="mt-6 rounded-[24px] border border-slate-200/70 bg-white px-6 py-10 text-center shadow-sm">
                <div className="mx-auto max-w-md">
                  <div className="text-xl font-semibold tracking-tight text-slate-900">No stays found</div>
                  <div className="mt-2 text-sm leading-relaxed text-slate-600">
                    Try searching for <span className="font-semibold">Jakarta</span>, <span className="font-semibold">Bandung</span>,
                    or <span className="font-semibold">Bali</span>, or adjust your dates.
                  </div>
                  <button
                    className="mt-6 inline-flex items-center justify-center rounded-[16px] bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200/60 active:translate-y-px"
                    onClick={() => {
                      setCity(initialQuery.city);
                      setCheckIn(initialQuery.checkIn);
                      setCheckOut(initialQuery.checkOut);
                      setGuests(initialQuery.guests);
                      void search(initialQuery);
                    }}
                  >
                    Reset to Jakarta
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <aside className="lg:col-span-4">
            <div className="rounded-[24px] border border-slate-200/70 bg-white p-6 shadow-[0_20px_60px_-45px_rgba(2,6,23,0.35)]">
              <div className="text-sm font-semibold text-slate-500">Why book with us</div>
              <div className="mt-2 text-lg font-semibold tracking-tight text-slate-900">A premium booking experience</div>

              <div className="mt-6 space-y-4 text-sm text-slate-600">
                <div className="rounded-[18px] border border-slate-200/70 bg-slate-50 px-4 py-4">
                  <div className="font-semibold text-slate-900">Transparent pricing</div>
                  <div className="mt-1">Clear nightly rates and promos—no surprises at checkout.</div>
                </div>
                <div className="rounded-[18px] border border-slate-200/70 bg-slate-50 px-4 py-4">
                  <div className="font-semibold text-slate-900">Trusted reviews</div>
                  <div className="mt-1">Verified ratings with quick highlights for amenities you care about.</div>
                </div>
                <div className="rounded-[18px] border border-slate-200/70 bg-slate-50 px-4 py-4">
                  <div className="font-semibold text-slate-900">Secure booking</div>
                  <div className="mt-1">Protected payments and instant confirmations for peace of mind.</div>
                </div>
              </div>

              <div className="mt-7 rounded-[18px] border border-brand-200/60 bg-brand-50 px-4 py-4 text-sm text-brand-900">
                <div className="font-semibold">Developer note</div>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <div className="min-w-0 truncate font-mono text-xs text-brand-900/80">{apiBaseUrl}</div>
                  <a
                    className="inline-flex shrink-0 items-center justify-center rounded-[14px] bg-white px-3 py-2 text-xs font-semibold text-brand-800 shadow-sm ring-1 ring-brand-200/60 transition hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200/60"
                    href={`${apiBaseUrl}/api/hotels/search?city=Jakarta&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`}
                    target="_blank"
                    onClick={() => logEvent("fe.srp.open_api.clicked", { checkIn, checkOut, guests })}
                  >
                    Open API
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
