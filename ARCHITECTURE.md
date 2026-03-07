# Architektura - Event Lead System

## Przegląd

Reużywalny szablon landing page dla firm eventowych. Jedno wdrożenie = jeden organizator, wiele wydarzeń.

## Stack technologiczny

- **Frontend**: Next.js 16 (App Router) + TypeScript
- **UI**: shadcn/ui + Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + RLS)
- **Email**: Resend + React Email
- **Kalendarz**: Google Calendar API + URL builder
- **Hosting**: Vercel

## Struktura

```
src/
  app/                         # Next.js App Router
    page.tsx                   # Strona główna (Hero + lista eventów)
    events/[slug]/page.tsx     # Strona wydarzenia (SSG z ISR)
    api/register/route.ts      # POST endpoint rejestracji
    api/revalidate/route.ts    # Webhook Supabase → ISR + Calendar sync
    polityka-prywatnosci/      # Strona statyczna
    sitemap.ts, robots.ts      # SEO
  components/
    layout/                    # Header, Footer
    sections/                  # Hero, EventList, Schedule, FAQ, etc.
    email/                     # Szablony React Email
    ui/                        # shadcn/ui (auto-generowane)
  config/site.config.ts        # Centralny plik konfiguracji brandingu
  lib/
    supabase/                  # Klienty + queries
    google-calendar.ts         # API sync + URL generator
    validators.ts              # Schematy Zod
    rate-limit.ts              # In-memory rate limiter
    resend.ts                  # Klient email (lazy init)
    format.ts                  # Formatowanie dat (pl-PL)
  types/index.ts               # Typy Event, Registration, etc.
```

## Flow rejestracji

1. Użytkownik wypełnia formularz na `/events/[slug]`
2. Client component POSTuje do `/api/register`
3. API: rate limit → walidacja Zod → RPC `register_for_event` (atomowa procedura SQL)
4. Po sukcesie: email via Resend z linkiem "Dodaj do Google Calendar"
5. Opcjonalny webhook do zewnętrznych integracji

## Baza danych

- `events` - wydarzenia z harmonogramem (JSONB), FAQ (JSONB), statusem
- `registrations` - zapisy z FK do events
- `events_with_seats` - view z policzeniem zajętych/wolnych miejsc
- `register_for_event` - RPC z FOR UPDATE lock (eliminuje race conditions)
- RLS: publiczny odczyt aktywnych eventów, insert rejestracji otwarty

## Konfiguracja

Cały branding w `src/config/site.config.ts`:
- Nazwa, opis, logo, kolory
- Dane kontaktowe organizatora
- FAQ domyślne
- Ustawienia email, webhook, rate limit

## Klonowanie pod nowego klienta

1. Skopiuj repozytorium
2. Edytuj `src/config/site.config.ts` (branding)
3. Edytuj CSS variables w `globals.css` (kolory)
4. Utwórz projekt Supabase, uruchom `supabase/migrations/001_init.sql`
5. Ustaw zmienne środowiskowe (`.env.local`)
6. Deploy na Vercel
