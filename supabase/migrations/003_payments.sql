-- Payment integration: Stripe
-- Run this in Supabase SQL Editor

-- ============================================
-- EVENTS: payment fields
-- ============================================

ALTER TABLE events
  ADD COLUMN payment_type TEXT NOT NULL DEFAULT 'free'
    CHECK (payment_type IN ('free', 'on_site', 'online')),
  ADD COLUMN price_amount INTEGER
    CHECK (price_amount IS NULL OR price_amount > 0);

-- ============================================
-- REGISTRATIONS: payment tracking
-- ============================================

ALTER TABLE registrations
  ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'not_required'
    CHECK (payment_status IN ('not_required', 'pending', 'paid', 'failed')),
  ADD COLUMN stripe_session_id TEXT,
  ADD COLUMN stripe_payment_id TEXT,
  ADD COLUMN paid_at TIMESTAMPTZ;

CREATE INDEX idx_registrations_stripe_session ON registrations(stripe_session_id);

-- ============================================
-- VIEW: Recreate events_with_seats
-- Only count paid registrations for online events
-- ============================================

DROP VIEW events_with_seats;

CREATE VIEW events_with_seats AS
SELECT
  e.*,
  COALESCE(SUM(
    CASE
      WHEN e.payment_type = 'online' AND r.payment_status NOT IN ('paid', 'not_required') THEN 0
      ELSE r.seats
    END
  ), 0)::INTEGER AS seats_taken,
  CASE
    WHEN e.seat_limit IS NULL THEN NULL
    ELSE e.seat_limit - COALESCE(SUM(
      CASE
        WHEN e.payment_type = 'online' AND r.payment_status NOT IN ('paid', 'not_required') THEN 0
        ELSE r.seats
      END
    ), 0)::INTEGER
  END AS seats_remaining
FROM events e
LEFT JOIN registrations r ON r.event_id = e.id
GROUP BY e.id;

-- ============================================
-- RPC: Updated register_for_event with payment support
-- ============================================

CREATE OR REPLACE FUNCTION register_for_event(
  p_event_id UUID,
  p_name TEXT,
  p_email TEXT,
  p_phone TEXT,
  p_seats INTEGER,
  p_rodo_consent BOOLEAN,
  p_payment_status TEXT DEFAULT 'not_required',
  p_stripe_session_id TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_seat_limit INTEGER;
  v_seats_taken INTEGER;
  v_status TEXT;
  v_payment_type TEXT;
  v_registration_id UUID;
BEGIN
  SELECT seat_limit, status, payment_type INTO v_seat_limit, v_status, v_payment_type
  FROM events WHERE id = p_event_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'EVENT_NOT_FOUND';
  END IF;

  IF v_status != 'active' THEN
    RAISE EXCEPTION 'EVENT_NOT_ACTIVE';
  END IF;

  IF v_seat_limit IS NOT NULL THEN
    SELECT COALESCE(SUM(seats), 0) INTO v_seats_taken
    FROM registrations WHERE event_id = p_event_id
      AND payment_status IN ('not_required', 'paid');

    IF v_seats_taken + p_seats > v_seat_limit THEN
      RAISE EXCEPTION 'NO_SEATS_AVAILABLE';
    END IF;
  END IF;

  INSERT INTO registrations (event_id, name, email, phone, seats, rodo_consent, payment_status, stripe_session_id)
  VALUES (p_event_id, p_name, p_email, p_phone, p_seats, p_rodo_consent, p_payment_status, p_stripe_session_id)
  RETURNING id INTO v_registration_id;

  RETURN v_registration_id;
END;
$$ LANGUAGE plpgsql;
