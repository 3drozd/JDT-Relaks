export interface Event {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  detailed_description: string | null;
  date: string;
  end_date: string | null;
  location: string;
  price: string | null;
  price_amount: number | null;
  payment_type: "free" | "on_site" | "online";
  seat_limit: number | null;
  status: "active" | "ended" | "draft";
  schedule: ScheduleItem[] | null;
  faq: FaqItem[] | null;
  media: MediaItem[] | null;
  og_image: string | null;
  google_calendar_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventWithSeats extends Event {
  seats_taken: number;
  seats_remaining: number | null;
}

export interface Registration {
  id: string;
  event_id: string;
  name: string;
  email: string;
  phone: string | null;
  seats: number;
  rodo_consent: boolean;
  confirmation_sent: boolean;
  payment_status: "not_required" | "pending" | "paid" | "failed";
  stripe_session_id: string | null;
  stripe_payment_id: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface MediaItem {
  type: "image" | "video";
  url: string;
  order: number;
}
