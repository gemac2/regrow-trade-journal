# AGENTS.md

Trading journal app: Next.js 16 (App Router) + React 19 + Tailwind v4 + Drizzle ORM on Neon Postgres, Neon Auth.

## Commands
- `npm run dev` / `npm run build` / `npm run start` / `npm run lint` (eslint flat config, `eslint.config.mjs`)
- No test runner and no `typecheck` script exist. Verify types with `npx tsc --noEmit`.
- Drizzle has no npm scripts — run directly: `npx drizzle-kit generate` / `push` / `migrate`. Config: `drizzle.config.ts` (schema `./db/schema.ts`, out `./drizzle`). The `drizzle/` migrations folder does not exist yet — generate it before migrating.

## Environment
- Required vars in `.env.local`: `DATABASE_URL`, `NEXT_PUBLIC_NEON_AUTH_URL`.
- `app/lib/db.ts` throws at import time if `DATABASE_URL` is unset — any SSR path touching it will crash without env.
- `drizzle.config.ts` loads `.env.local` via dotenv, so drizzle-kit commands need that file present.

## Architecture quirks
- Path alias `@/*` maps to repo root (`tsconfig.json`), so imports look like `@/app/...`, `@/components/...`, `@/db/schema`.
- All DB access is via server actions in `app/actions.ts`; the client calls them from components/context (`AccountContext` in `app/context/AccountContext.tsx`).
- Auth is client-side only: `useAuth` (`app/hooks/useAuth.ts`) reads session via `authClient` (`app/lib/auth.ts`). `middleware.ts` is a deliberate no-op pass-through; route protection lives in `app/(main)/layout.tsx` (redirects to `/login`). Do not assume server-side session checks exist — server actions trust the `userId` passed from the client.
- `db/schema.ts` deliberately omits the `user` table (Neon owns it): `accounts.userId`/`trades.userId`/`userProfiles.userId` are plain text, and only `trades.accountId -> accounts.id` has a real FK. Profile name/email come from the auth client, not the DB.
- Numeric columns are `numeric` → returned as strings; `pnl` is recomputed server-side on create/update as `(exit-entry)*size*(LONG?1:-1)` and drives `status` (WIN/LOSS/BREAKEVEN/OPEN).
- Root layout `app/layout.tsx` is a client component (`NeonAuthUIProvider`); UI copy is largely Spanish, landing page English, `<html lang="es">`.

## Gotchas
- No tests, no CI, no pre-commit. Don't invent test commands.
- `revalidatePath('/')` is used everywhere; pages rely on it rather than router.refresh().
- `trades.status` values WIN/LOSS/BREAKEVEN/OPEN; `type` is SHORT/LONG; symbol stored uppercased.
