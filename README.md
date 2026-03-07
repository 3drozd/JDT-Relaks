# Event Lead System - Template v1

Reużywalny szablon landing page dla firm organizujących wydarzenia. System automatyzuje zapisy uczestników, wysyłkę potwierdzeń mailowych i synchronizację z Google Calendar.

## Funkcje

- Lista wydarzeń z dynamicznymi stronami (`/events/[slug]`)
- Formularz rejestracji z walidacją i limitem miejsc
- Automatyczny email potwierdzający (Resend + React Email)
- Przycisk "Dodaj do Google Calendar" w mailu
- Synchronizacja wydarzeń z Google Calendar organizatora
- SEO: meta tagi, JSON-LD, sitemap, robots
- Responsywny design (mobile-first)
- Rate limiting na endpointach
- Konfigurowalny branding (kolory, logo, teksty)

## Quick Start

### 1. Instalacja

```bash
npm install
```

### 2. Konfiguracja Supabase

1. Utwórz projekt na [supabase.com](https://supabase.com)
2. W SQL Editor uruchom zawartość `supabase/migrations/001_init.sql`
3. Skopiuj URL i klucze projektu

### 3. Zmienne środowiskowe

Skopiuj `.env.example` do `.env.local` i uzupełnij:

```bash
cp .env.example .env.local
```

Wymagane:
- `NEXT_PUBLIC_SUPABASE_URL` - URL projektu Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - klucz anon
- `SUPABASE_SERVICE_ROLE_KEY` - klucz service role
- `RESEND_API_KEY` - klucz API Resend

Opcjonalne (Google Calendar sync):
- `GOOGLE_CLIENT_EMAIL` - email service account
- `GOOGLE_PRIVATE_KEY` - klucz prywatny
- `GOOGLE_CALENDAR_ID` - ID kalendarza organizatora

### 4. Uruchomienie

```bash
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000).

### 5. Branding

Edytuj `src/config/site.config.ts` - nazwa firmy, dane kontaktowe, FAQ, ustawienia email.

Kolory motywu: edytuj CSS variables w `src/app/globals.css` (sekcja `:root`).

## Google Calendar - konfiguracja

### Dla uczestnika (automatyczne)
Link "Dodaj do Google Calendar" jest generowany automatycznie w mailu potwierdzającym. Zero konfiguracji.

### Dla organizatora (opcjonalne)
1. Utwórz projekt w [Google Cloud Console](https://console.cloud.google.com)
2. Włącz Google Calendar API
3. Utwórz service account i pobierz klucz JSON
4. Udostępnij kalendarz organizatora service account (uprawnienie "Edycja wydarzeń")
5. Ustaw zmienne: `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_CALENDAR_ID`

## Deploy na Vercel

1. Push na GitHub
2. Połącz repo w Vercel
3. Ustaw zmienne środowiskowe
4. Deploy

Opcjonalnie: ustaw Database Webhook w Supabase na INSERT do tabeli `events`, kierujący na `https://twoja-domena.com/api/revalidate` z headerem `x-webhook-secret`.

## Architektura

Zobacz [ARCHITECTURE.md](ARCHITECTURE.md).
