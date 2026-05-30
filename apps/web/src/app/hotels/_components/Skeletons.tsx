export function HotelCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-slate-200/70 bg-white shadow-[0_20px_60px_-45px_rgba(2,6,23,0.35)]">
      <div className="aspect-[16/9] animate-pulse bg-slate-200/60" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="h-5 w-2/3 animate-pulse rounded-lg bg-slate-200/70" />
            <div className="mt-2 h-4 w-full animate-pulse rounded-lg bg-slate-200/60" />
            <div className="mt-2 h-4 w-4/5 animate-pulse rounded-lg bg-slate-200/60" />
          </div>
          <div className="h-8 w-24 animate-pulse rounded-full bg-slate-200/60" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="h-7 w-20 animate-pulse rounded-full bg-slate-200/60" />
          <div className="h-7 w-24 animate-pulse rounded-full bg-slate-200/60" />
          <div className="h-7 w-16 animate-pulse rounded-full bg-slate-200/60" />
        </div>
        <div className="mt-5 flex items-end justify-between gap-4">
          <div className="flex-1">
            <div className="h-3 w-20 animate-pulse rounded-lg bg-slate-200/60" />
            <div className="mt-2 h-6 w-40 animate-pulse rounded-lg bg-slate-200/70" />
          </div>
          <div className="h-10 w-28 animate-pulse rounded-[16px] bg-slate-200/70" />
        </div>
      </div>
    </div>
  );
}

