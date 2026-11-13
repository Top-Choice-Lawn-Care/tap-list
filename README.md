# JJ Game Plan

Mobile-first BJJ app: a movement tree (positions to transitions and submissions), a tap log, and a roll timer. It runs as a web app and PWA. Screens are client-rendered so the same UI can later be wrapped (for example with Capacitor) for iOS and Android.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm run lint
npx tsc --noEmit
```

`npm run build` succeeds with no environment variables set.

## Supabase (optional)

Cloud sign-in and tap sync stay off until both of these are set:

| Variable | What it is |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |

Copy `.env.example` to `.env.local` and fill them in. Without them, taps stay in `localStorage` under the key `tap-list-data` (`{ [submissionName]: [{ date, note }] }`). Signing in migrates that log into the `taps` table from `supabase/schema.sql` and keeps writing locally as well.

Do not put the Supabase service-role key in the client, `.env.local` committed files, or the repo. The anon key is public; row access is limited by the table's RLS policy.
