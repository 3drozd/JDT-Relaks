-- Ewidencja sprzedaży ręcznej (płatności gotówkowe / na miejscu)
CREATE TABLE accounting_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  amount_grosz INTEGER NOT NULL,
  registration_id UUID REFERENCES registrations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ewidencja kosztów
CREATE TABLE accounting_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount_grosz INTEGER NOT NULL,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tylko service role ma dostęp
ALTER TABLE accounting_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_expenses ENABLE ROW LEVEL SECURITY;
