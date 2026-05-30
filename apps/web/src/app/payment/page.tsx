"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { logEvent, logException } from "@demo/sdk";
import { apiFetch } from "@/lib/api";
import { formatIdr } from "@/lib/format";

type Money = { currency: "IDR"; amount: number };

type Room = {
  id: string;
  hotelId: string;
  name: string;
  refundable: boolean;
  breakfastIncluded: boolean;
  pricePerNight: Money;
};

type Quote = {
  id: string;
  room: Room;
  nights: number;
  subtotal: Money;
  taxesAndFees: Money;
  total: Money;
  createdAt: string;
};

type PaymentMethod =
  | { type: "VIRTUAL_ACCOUNT"; provider: "BCA" | "BNI" | "MANDIRI" }
  | { type: "EWALLET"; provider: "OVO" | "DANA" | "GOPAY" }
  | { type: "CARD"; last4: string };

type PayResponse = {
  quote: Quote;
  attempt: { id: string; status: "SUCCESS" | "FAILED"; failureReason?: string };
};

export default function PaymentPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const quoteId = sp.get("quoteId") ?? "";
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [forceFail, setForceFail] = useState(false);
  const [cardLast4, setCardLast4] = useState("4242");
  const [result, setResult] = useState<PayResponse["attempt"] | null>(null);
  const [error, setError] = useState("");
  const apiBaseUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001",
    [],
  );

  useEffect(() => {
    logEvent("fe.payment.view", { quoteId });
  }, [quoteId]);

  const loadQuote = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch<{ quote: Quote }>(`/api/booking/quote/${quoteId}`, {
        requestName: "Get Quote",
      });
      setQuote(data.quote);
      logEvent("fe.payment.quote.loaded", { quoteId, total: data.quote.total.amount });
    } catch (err) {
      logException(err, { where: "PaymentPage.loadQuote", quoteId });
      setError("Failed to load quote. Check Sentry.");
    } finally {
      setLoading(false);
    }
  }, [quoteId]);

  async function pay(method: PaymentMethod) {
    setPaying(true);
    setError("");
    setResult(null);
    try {
      logEvent("fe.payment.pay.clicked", { quoteId, methodType: method.type, forceFail });
      const data = await apiFetch<PayResponse>("/api/payment/pay", {
        method: "POST",
        body: JSON.stringify({ quoteId, method, forceFail }),
        requestName: "Pay",
      });
      setResult(data.attempt);
      logEvent("fe.payment.pay.success", { quoteId, status: data.attempt.status });
    } catch (err) {
      logException(err, { where: "PaymentPage.pay", quoteId });
      setError("Payment request failed. Check Sentry.");
    } finally {
      setPaying(false);
    }
  }

  useEffect(() => {
    if (!quoteId) {
      setLoading(false);
      setError("Missing quoteId. Go back to SRP and book a room.");
      return;
    }
    void loadQuote();
  }, [loadQuote, quoteId]);

  const cardClass = "rounded-2xl border border-brand-100/70 bg-white/85 shadow-sm backdrop-blur";
  const cardInnerClass = "p-5 sm:p-6";
  const inputClass =
    "w-full rounded-xl border border-brand-200/70 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-200/40";

  if (loading) {
    return (
      <div className={cardClass}>
        <div className={`${cardInnerClass} text-sm font-semibold text-slate-600`}>Loading payment...</div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className={cardClass}>
        <div className={cardInnerClass}>
          <h1 className="text-lg font-extrabold tracking-tight text-slate-900">Payment</h1>
          <div className="mt-2 text-sm font-semibold text-slate-600">{error || "Quote not found."}</div>
          <div className="mt-4">
            <Link className="btn-ghost" href="/hotels" onClick={() => logEvent("fe.payment.back_to_srp.clicked", { quoteId })}>
              Back to SRP
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
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900">Payment</h1>
              <div className="mt-1 text-sm font-semibold text-slate-600">
                Quote <span className="font-mono font-bold text-slate-900">{quote.id}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                className="btn-ghost"
                href={`${apiBaseUrl}/api/booking/quote/${quoteId}`}
                target="_blank"
                onClick={() => logEvent("fe.payment.open_api.clicked", { quoteId })}
              >
                Open API
              </a>
              <button className="btn-ghost" onClick={() => { logEvent("fe.payment.refresh.clicked", { quoteId }); router.refresh(); }}>
                Refresh
              </button>
              <span className="inline-flex items-center rounded-full border border-sun-200 bg-sun-50 px-3 py-1 text-xs font-semibold text-sun-900">
                Payment
              </span>
            </div>
          </div>

          {error ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              {error}
            </div>
          ) : null}

          {result ? (
            <div
              className={`mt-4 inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
                result.status === "SUCCESS"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${result.status === "SUCCESS" ? "bg-emerald-500" : "bg-red-500"}`} />
              Result: <span className="font-mono font-bold">{result.status}</span>
              {result.failureReason ? <span className="font-mono">({result.failureReason})</span> : null}
            </div>
          ) : null}

          <div className="mt-5 h-px w-full bg-brand-100" />

          <div className="mt-5 text-sm font-extrabold text-slate-900">Choose payment method</div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
              <input
                type="checkbox"
                checked={forceFail}
                onChange={(e) => setForceFail(e.target.checked)}
                className="h-4 w-4 accent-brand-600"
              />
              Force fail
            </label>
            <div className="text-xs font-semibold text-slate-600">(untuk test error case)</div>
          </div>

          <div className="mt-4 rounded-2xl border border-brand-100 bg-white/90 p-4 shadow-sm">
            <div className="text-sm font-extrabold text-slate-900">Card (mock)</div>
            <div className="mt-1 text-xs font-semibold text-slate-600">last4=0000 akan fail otomatis.</div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                className={inputClass}
                value={cardLast4}
                onChange={(e) => setCardLast4(e.target.value.replaceAll(/\D/g, "").slice(0, 4))}
                placeholder="4242"
                style={{ width: 140 }}
              />
              <button
                className="btn-primary"
                onClick={() => void pay({ type: "CARD", last4: cardLast4.padStart(4, "0").slice(-4) })}
                disabled={paying}
              >
                {paying ? "Paying..." : "Pay with Card"}
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={() => void pay({ type: "VIRTUAL_ACCOUNT", provider: "BCA" })} disabled={paying}>
              Pay via VA BCA
            </button>
            <button className="btn-ghost" onClick={() => void pay({ type: "EWALLET", provider: "GOPAY" })} disabled={paying}>
              Pay via GoPay
            </button>
            <button
              className="btn-primary"
              onClick={() => void pay({ type: "EWALLET", provider: "DANA" })}
              disabled={paying}
            >
              Pay (likely fail)
            </button>
          </div>
        </div>
      </section>

      <aside className={cardClass}>
        <div className={cardInnerClass}>
          <div className="text-sm font-extrabold text-slate-900">Summary</div>
          <div className="mt-4 h-px w-full bg-brand-100" />
          <div className="mt-4 text-xs font-bold text-slate-600">Room</div>
          <div className="mt-1 text-sm font-extrabold text-slate-900">{quote.room.name}</div>
          <div className="mt-2 text-xs font-semibold text-slate-600">Nights: {quote.nights}</div>

          <div className="mt-4 h-px w-full bg-brand-100" />

          <div className="mt-4 overflow-hidden rounded-2xl border border-brand-100 bg-white/90">
            <div className="grid grid-cols-2 gap-0 text-sm">
              <div className="px-4 py-3 text-slate-600">Subtotal</div>
              <div className="px-4 py-3 text-right font-extrabold text-slate-900">{formatIdr(quote.subtotal.amount)}</div>
              <div className="border-t border-brand-100 px-4 py-3 text-slate-600">Taxes & fees</div>
              <div className="border-t border-brand-100 px-4 py-3 text-right font-extrabold text-slate-900">
                {formatIdr(quote.taxesAndFees.amount)}
              </div>
              <div className="border-t border-brand-100 px-4 py-3 font-extrabold text-slate-900">Total</div>
              <div className="border-t border-brand-100 px-4 py-3 text-right text-base font-black text-slate-900">
                {formatIdr(quote.total.amount)}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-xs font-semibold text-slate-700">
            FE logs: fe.payment.*, fe.request.* <br />
            BE logs: be.booking.quote.get.*, be.payment.pay.*
          </div>
        </div>
      </aside>
    </div>
  );
}
