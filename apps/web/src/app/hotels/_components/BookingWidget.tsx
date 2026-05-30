"use client";

import type { ReactNode } from "react";
import { IconCalendar, IconPin, IconUsers } from "./Icons";

type Props = {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  loading: boolean;
  onCityChange: (value: string) => void;
  onCheckInChange: (value: string) => void;
  onCheckOutChange: (value: string) => void;
  onGuestsChange: (value: number) => void;
  onSearch: () => void;
  variant: "hero" | "sticky";
};

function Field(props: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  compact?: boolean;
}) {
  const labelClass = props.compact ? "text-[11px] font-semibold text-slate-500" : "text-xs font-semibold text-slate-600";
  return (
    <div className="min-w-0">
      <div className={`flex items-center gap-2 ${labelClass}`}>
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
          {props.icon}
        </span>
        <span>{props.label}</span>
      </div>
      <div className="mt-2">{props.children}</div>
    </div>
  );
}

export default function BookingWidget({
  city,
  checkIn,
  checkOut,
  guests,
  loading,
  onCityChange,
  onCheckInChange,
  onCheckOutChange,
  onGuestsChange,
  onSearch,
  variant,
}: Props) {
  const isSticky = variant === "sticky";
  const inputClass =
    "w-full rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus-visible:border-brand-400 focus-visible:ring-4 focus-visible:ring-brand-200/50";

  const containerClass = isSticky
    ? "rounded-[20px] border border-slate-200/80 bg-white/80 shadow-[0_20px_60px_-30px_rgba(2,6,23,0.45)] backdrop-blur-xl"
    : "rounded-[24px] border border-white/30 bg-white/15 shadow-[0_30px_80px_-40px_rgba(2,6,23,0.65)] backdrop-blur-2xl";

  return (
    <div className={containerClass}>
      <div className={isSticky ? "p-3 sm:p-4" : "p-5 sm:p-6"}>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-4">
            <Field label="Destination" icon={<IconPin className="h-4 w-4" />} compact={isSticky}>
              <label className="sr-only" htmlFor={`city-${variant}`}>
                Destination
              </label>
              <input
                id={`city-${variant}`}
                className={inputClass}
                value={city}
                onChange={(e) => onCityChange(e.target.value)}
                placeholder="Jakarta, Bandung, Bali…"
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-2">
            <Field label="Check-in" icon={<IconCalendar className="h-4 w-4" />} compact={isSticky}>
              <label className="sr-only" htmlFor={`checkin-${variant}`}>
                Check-in
              </label>
              <input
                id={`checkin-${variant}`}
                className={inputClass}
                type="date"
                value={checkIn}
                onChange={(e) => onCheckInChange(e.target.value)}
              />
            </Field>
            <Field label="Check-out" icon={<IconCalendar className="h-4 w-4" />} compact={isSticky}>
              <label className="sr-only" htmlFor={`checkout-${variant}`}>
                Check-out
              </label>
              <input
                id={`checkout-${variant}`}
                className={inputClass}
                type="date"
                value={checkOut}
                onChange={(e) => onCheckOutChange(e.target.value)}
              />
            </Field>
          </div>
          <div className="lg:col-span-2">
            <Field label="Guests" icon={<IconUsers className="h-4 w-4" />} compact={isSticky}>
              <label className="sr-only" htmlFor={`guests-${variant}`}>
                Guests
              </label>
              <input
                id={`guests-${variant}`}
                className={inputClass}
                type="number"
                min={1}
                value={guests}
                onChange={(e) => onGuestsChange(Number(e.target.value))}
              />
            </Field>
          </div>
          <div className="lg:col-span-1">
            <button
              className={`inline-flex w-full items-center justify-center gap-2 rounded-[18px] bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_45px_-20px_rgba(37,99,235,0.75)] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200/60 active:translate-y-px ${
                loading
                  ? "cursor-not-allowed opacity-75"
                  : "hover:bg-brand-700 hover:shadow-[0_20px_55px_-22px_rgba(37,99,235,0.85)]"
              }`}
              onClick={onSearch}
              disabled={loading}
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
