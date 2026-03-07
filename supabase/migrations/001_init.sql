-- Event Lead System - Initial Schema
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT NOT NULL,
  price TEXT,
  seat_limit INTEGER,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'ended', 'draft')),
  schedule JSONB,
  faq JSONB,
  og_image TEXT,
  google_calendar_event_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  seats INTEGER NOT NULL DEFAULT 1
    CHECK (seats >= 1 AND seats <= 10),
  rodo_consent BOOLEAN NOT NULL DEFAULT TRUE,
  confirmation_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_status ON events(status);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- VIEW: Events with seat counts
-- ============================================

CREATE VIEW events_with_seats AS
SELECT
  e.*,
  COALESCE(SUM(r.seats), 0)::INTEGER AS seats_taken,
  CASE
    WHEN e.seat_limit IS NULL THEN NULL
    ELSE e.seat_limit - COALESCE(SUM(r.seats), 0)::INTEGER
  END AS seats_remaining
FROM events e
LEFT JOIN registrations r ON r.event_id = e.id
GROUP BY e.id;

-- ============================================
-- RPC: Atomic registration (prevents race conditions)
-- ============================================

CREATE OR REPLACE FUNCTION register_for_event(
  p_event_id UUID,
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_seats INTEGER,
  p_rodo_consent BOOLEAN
) RETURNS UUID AS $$
DECLARE
  v_seat_limit INTEGER;
  v_seats_taken INTEGER;
  v_status TEXT;
  v_registration_id UUID;
BEGIN
  -- Lock the event row to prevent concurrent modifications
  SELECT seat_limit, status INTO v_seat_limit, v_status
  FROM events WHERE id = p_event_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'EVENT_NOT_FOUND';
  END IF;

  IF v_status != 'active' THEN
    RAISE EXCEPTION 'EVENT_NOT_ACTIVE';
  END IF;

  IF v_seat_limit IS NOT NULL THEN
    SELECT COALESCE(SUM(seats), 0) INTO v_seats_taken
    FROM registrations WHERE event_id = p_event_id;

    IF v_seats_taken + p_seats > v_seat_limit THEN
      RAISE EXCEPTION 'NO_SEATS_AVAILABLE';
    END IF;
  END IF;

  INSERT INTO registrations (event_id, name, email, phone, seats, rodo_consent)
  VALUES (p_event_id, p_name, p_email, p_phone, p_seats, p_rodo_consent)
  RETURNING id INTO v_registration_id;

  RETURN v_registration_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Events: public read for active/ended
CREATE POLICY "Public can read published events"
  ON events FOR SELECT
  USING (status IN ('active', 'ended'));

-- Events: service role manages all
CREATE POLICY "Service role manages events"
  ON events FOR ALL
  USING (auth.role() = 'service_role');

-- Registrations: anyone can insert
CREATE POLICY "Anyone can register"
  ON registrations FOR INSERT
  WITH CHECK (TRUE);

-- Registrations: only service role can read/update/delete
CREATE POLICY "Service role reads registrations"
  ON registrations FOR SELECT
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role updates registrations"
  ON registrations FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role deletes registrations"
  ON registrations FOR DELETE
  USING (auth.role() = 'service_role');

-- ============================================
-- SEED DATA (example event for development)
-- ============================================

INSERT INTO events (name, slug, description, date, end_date, location, price, seat_limit, status, schedule, faq)
VALUES (
  'Letni Koncert w Parku',
  'letni-koncert-w-parku',
  'Zapraszamy na wyjątkowy letni koncert w sercu miasta! Wystąpią lokalni artyści, a na gości czeka wiele atrakcji.',
  '2026-07-15T18:00:00+02:00',
  '2026-07-15T22:00:00+02:00',
  'Park Miejski, ul. Parkowa 1, Warszawa',
  '50 PLN',
  100,
  'active',
  '[{"time": "18:00", "title": "Otwarcie bram", "description": "Rejestracja uczestników"}, {"time": "18:30", "title": "Koncert zespołu Sunrise", "description": "Muzyka indie-folk"}, {"time": "20:00", "title": "Przerwa", "description": "Strefa food trucków"}, {"time": "20:30", "title": "Koncert główny", "description": "Gwiazda wieczoru"}, {"time": "22:00", "title": "Zakończenie"}]',
  NULL
),
(
  'Warsztaty fotografii portretowej',
  'warsztaty-fotografii',
  'Intensywne warsztaty z profesjonalnym fotografem. Nauczysz się technik oświetlenia, kompozycji i pracy z modelem.',
  '2026-08-10T10:00:00+02:00',
  '2026-08-10T16:00:00+02:00',
  'Studio Kreatywne, ul. Artystyczna 5, Kraków',
  '200 PLN',
  15,
  'active',
  '[{"time": "10:00", "title": "Wprowadzenie teoretyczne"}, {"time": "11:30", "title": "Sesja praktyczna - światło naturalne"}, {"time": "13:00", "title": "Przerwa obiadowa"}, {"time": "14:00", "title": "Sesja praktyczna - światło studyjne"}, {"time": "15:30", "title": "Przegląd prac i feedback"}]',
  '[{"question": "Czy muszę mieć własny aparat?", "answer": "Tak, potrzebny jest aparat z możliwością ręcznych ustawień."}, {"question": "Jaki poziom zaawansowania jest wymagany?", "answer": "Warsztaty są przeznaczone dla osób ze średnim doświadczeniem."}]'
);
