import * as Sentry from "@sentry/nextjs";

if (!process.env.SENTRY_STORE_URL && !process.env.NEXT_PUBLIC_SENTRY_STORE_URL) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
}
