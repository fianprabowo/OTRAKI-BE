# Sentry FE/BE Demo (Next.js Monorepo)

Monorepo sederhana untuk mengirim log ke Sentry dari:
- Frontend Next.js: `apps/web` (port 3000)
- Backend Next.js (API service): `apps/api` (port 3001)
- Shared SDK: `packages/sdk`

## Setup

1. Copy env example:
   - `apps/web/.env.example` → `apps/web/.env.local`
   - `apps/api/.env.example` → `apps/api/.env.local`

2. Isi DSN:
   - FE: `NEXT_PUBLIC_SENTRY_DSN`
   - BE: `SENTRY_DSN`

3. Install dependencies:

```bash
npm install
```

## Run

Jalankan FE + BE sekaligus:

```bash
npm run dev
```

Atau terpisah:

```bash
npm run dev:web
npm run dev:api
```

FE akan jalan di: `http://localhost:3000`  
BE akan jalan di: `http://localhost:3001`

## Endpoints

- SRP: `http://localhost:3000/hotels`
- PDP: `http://localhost:3000/hotels/{hotelId}`
- Payment: `http://localhost:3000/payment?quoteId=...`

### API

- `GET http://localhost:3001/api/hotels/search?city=Jakarta&checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD&guests=2`
- `GET http://localhost:3001/api/hotels/{hotelId}`
- `POST http://localhost:3001/api/booking/quote` body: `{ "hotelId": "...", "roomId": "...", "checkIn": "...", "checkOut": "...", "guests": 2 }`
- `GET http://localhost:3001/api/booking/quote/{quoteId}`
- `POST http://localhost:3001/api/payment/pay` body: `{ "quoteId": "...", "method": { ... }, "forceFail": false }`
- `GET http://localhost:3001/api/test/error` (selalu error)
