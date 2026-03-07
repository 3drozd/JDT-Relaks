import type { FaqItem } from "@/types";

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  logo: string;
  ogImage: string;
  organizer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  social: {
    facebook: string;
    instagram: string;
  };
  footer: {
    links: { label: string; href: string }[];
    copyright: string;
  };
  email: {
    from: string;
    replyTo: string;
  };
  webhookUrl: string | null;
  rateLimit: {
    maxPerMinute: number;
  };
  faq: FaqItem[];
}

export const siteConfig: SiteConfig = {
  // Branding
  name: "JDT Relaks",
  description: "Koncerty relaksacyjne",
  url: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  logo: "/images/logo.png",
  ogImage: "/images/og-default.jpg",

  // Dane organizatora
  organizer: {
    name: "Justyna Drozd-Tietianiec",
    email: "justy78@gmail.com",
    phone: "+48 502 385 310",
    address: "",
  },

  // Social media
  social: {
    facebook: "",
    instagram: "",
  },

  // Stopka
  footer: {
    links: [
      { label: "Polityka prywatności", href: "/polityka-prywatnosci" },
    ],
    copyright: "© 2026 JDT Relaks. Wszelkie prawa zastrzeżone.",
  },

  // Email
  email: {
    from: "JDT Relaks <onboarding@resend.dev>",
    replyTo: "justy78@gmail.com",
  },

  // Webhook (opcjonalny)
  webhookUrl: process.env.WEBHOOK_URL || null,

  // Rate limiting
  rateLimit: {
    maxPerMinute: 5,
  },

  // FAQ domyślne (nadpisywane per event w bazie)
  faq: [
    {
      question: "Jak mogę się zapisać na koncert?",
      answer:
        "Wypełnij formularz rejestracyjny na stronie wybranego wydarzenia.",
    },
    {
      question: "Czy mogę anulować rejestrację?",
      answer: "Tak, skontaktuj się z nami mailowo na justy78@gmail.com.",
    },
    {
      question: "Czy otrzymam potwierdzenie?",
      answer:
        "Tak, po rejestracji otrzymasz automatyczny email z potwierdzeniem i linkiem do dodania wydarzenia do kalendarza.",
    },
  ],
};
