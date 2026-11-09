# Paisa

Paisa is a personal expenses tracker for natural-language transaction entry, account balances, UPI activity, ATM withdrawals, and cash tracking.

## Features

- Responsive dashboard with balances, spending summary, accounts, and activity search.
- Natural-language entry such as `₹420 on Swiggy using HDFC Bank`.
- Server-side Gemini parsing endpoint at `POST /api/parse`.
- Prisma schema for users, bank/cash accounts, and transaction types.
- Integer minor-unit money storage for safe balance arithmetic.

## Setup

Copy `.env.example` to `.env` and configure PostgreSQL, Google OAuth, and Gemini. Then run:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Google OAuth and authenticated mutation endpoints are the next integration layer; the current dashboard is intentionally usable with local demo state while those credentials are configured.
