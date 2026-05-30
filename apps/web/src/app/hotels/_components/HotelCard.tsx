"use client";

import Image from "next/image";
import Link from "next/link";
import { IconHeart, IconStar } from "./Icons";
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

type SearchResult = {
  hotel: Hotel;
  lowestPricePerNight: Money;
};

function formatCompact(number: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(number);
}

export default function HotelCard(props: {
  result: SearchResult;
  href: string;
  onOpen: () => void;
  priceLabel: string;
}) {
  const { hotel } = props.result;
  const base = props.result.lowestPricePerNight.amount;
  const discountRate = hotel.rating >= 4.65 ? 0.12 : hotel.rating >= 4.45 ? 0.08 : 0;
  const hasDiscount = discountRate > 0;
  const original = hasDiscount ? Math.round(base / (1 - discountRate)) : base;
  const discounted = hasDiscount ? base : base;

  return (
    <div className="group overflow-hidden rounded-[20px] border border-slate-200/70 bg-white shadow-[0_20px_60px_-45px_rgba(2,6,23,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_80px_-52px_rgba(2,6,23,0.5)]">
      <div className="relative">
        <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
          <Image
            src={hotel.imageUrl}
            alt={hotel.name}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            priority={false}
          />
        </div>
        <button
          type="button"
          className="absolute right-3 top-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-slate-700 shadow-sm ring-1 ring-white/40 backdrop-blur transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200/60"
          aria-label="Save to wishlist"
        >
          <IconHeart className="h-5 w-5" />
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">{hotel.name}</div>
            <div className="mt-1 line-clamp-2 text-sm text-slate-600">{hotel.address}</div>
          </div>
          <div className="shrink-0 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/70">
            <span className="inline-flex items-center gap-1">
              <IconStar className="h-4 w-4 text-sun-500" />
              {hotel.rating.toFixed(1)}
            </span>
            <span className="ml-2 text-slate-500">({formatCompact(hotel.reviewCount)})</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {hotel.amenities.slice(0, 5).map((a) => (
            <span
              key={a}
              className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800 ring-1 ring-brand-100"
            >
              {a}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-slate-500">{props.priceLabel}</div>
            <div className="mt-1 flex flex-wrap items-baseline gap-2">
              {hasDiscount ? (
                <span className="text-sm font-semibold text-slate-400 line-through">{formatIdr(original)}</span>
              ) : null}
              <span className="text-xl font-semibold tracking-tight text-slate-900">{formatIdr(discounted)}</span>
              <span className="text-sm font-semibold text-slate-500">/night</span>
              {hasDiscount ? (
                <span className="rounded-full bg-sun-50 px-2.5 py-1 text-xs font-semibold text-sun-800 ring-1 ring-sun-200">
                  {Math.round(discountRate * 100)}% off
                </span>
              ) : null}
            </div>
          </div>
          <Link
            href={props.href}
            onClick={props.onOpen}
            className="inline-flex shrink-0 items-center justify-center rounded-[16px] bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200/60 active:translate-y-px"
          >
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}
