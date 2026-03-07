import { z } from "zod";

export const registrationSchema = z.object({
  eventId: z.string().uuid(),
  name: z
    .string()
    .min(2, "Imię i nazwisko jest wymagane (min. 2 znaki)")
    .max(100, "Imię i nazwisko jest za długie"),
  email: z.string().email("Nieprawidłowy adres email"),
  phone: z.string().optional().nullable(),
  seats: z
    .number()
    .int("Liczba miejsc musi być liczbą całkowitą")
    .min(1, "Minimalna liczba miejsc to 1")
    .max(10, "Maksymalna liczba miejsc to 10"),
  rodoConsent: z.literal(true, {
    error: "Zgoda na przetwarzanie danych jest wymagana",
  }),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const eventSchema = z.object({
  name: z.string().min(2, "Nazwa jest wymagana (min. 2 znaki)"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug może zawierać tylko małe litery, cyfry i myślniki")
    .optional(),
  description: z.string().nullable().optional(),
  detailed_description: z.string().nullable().optional(),
  date: z.string().min(1, "Data jest wymagana"),
  end_date: z.string().nullable().optional(),
  location: z.string().min(2, "Lokalizacja jest wymagana"),
  price: z.string().nullable().optional(),
  price_amount: z.number().int().min(1).nullable().optional(),
  payment_type: z.enum(["free", "on_site", "online"]).default("free"),
  seat_limit: z.number().int().min(1).nullable().optional(),
  status: z.enum(["active", "ended", "draft"]),
  schedule: z
    .array(
      z.object({
        time: z.string(),
        title: z.string(),
        description: z.string().optional(),
      })
    )
    .nullable()
    .optional(),
  faq: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      })
    )
    .nullable()
    .optional(),
});

export type EventInput = z.infer<typeof eventSchema>;
