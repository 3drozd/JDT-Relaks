export type Lang = "pl" | "en";

export const translations = {
  pl: {
    nav: {
      home: "Strona główna",
      contact: "Kontakt",
    },
    hero: {
      description: "Koncerty relaksacyjne",
      cta: "Zobacz wydarzenia",
    },
    concerts: {
      heading: "Koncerty, które czujesz",
      body: "To nie zwykły koncert. To doświadczenie, które pozwala Ci się zatrzymać, odetchnąć i poczuć harmonię dźwięku. Każde spotkanie to chwila tylko dla Ciebie — bez pośpiechu, bez hałasu, bez oczekiwań.",
      features: [
        {
          title: "Żywe brzmienie",
          description: "Koncerty na żywo z użyciem instrumentów relaksacyjnych.",
        },
        {
          title: "Głęboki relaks",
          description: "Niskie częstotliwości obniżają stres i wyciszają umysł.",
        },
        {
          title: "Chwila dla siebie",
          description: "Czas na oddech, wyciszenie i regenerację w kameralnej atmosferze.",
        },
      ],
    },
    drum: {
      label: "Instrument premium",
      heading: "Poznaj Tank Drum",
      playBtn: "Zagraj",
      learnBtn: "Dowiedz się więcej",
      backBtn: "← Wróć",
      features: [
        {
          title: "Ręczna produkcja",
          description: "Każdy instrument jest ręcznie strojony i wykańczany z dbałością o każdy detal.",
        },
        {
          title: "Relaksacyjny dźwięk",
          description: "Ciepłe, rezonujące tony pomagają się wyciszyć i odprężyć po ciężkim dniu.",
        },
        {
          title: "Dla każdego",
          description: "Nie wymaga doświadczenia muzycznego — wystarczy dotknąć, żeby zagrać.",
        },
      ],
      songs: ["Świeć, gwiazdeczko", "Oda do Radości", "Medytacja"],
      detail: {
        label: "Szczegóły",
        titleSuffix: "— bliżej",
        gallery: "Galeria",
        orders: "Zrealizowane zamówienia",
        info: [
          {
            title: "Materiał i konstrukcja",
            description:
              "Wykonany z wysokogatunkowej stali, formowany i strojony ręcznie. Grubość i kształt każdego języczka wpływa na ton i sustain dźwięku.",
          },
          {
            title: "Strojenie i skale",
            description:
              "Dostępne w różnych skalach muzycznych — pentatonicznej, durowej, molowej i wielu innych. Każdy instrument jest precyzyjnie strojony chromatycznym tunerem.",
          },
          {
            title: "Wzory artystyczne",
            description:
              "Na zamówienie wykonujemy unikalne wzory — geometryczne, organiczne, mandale i inne. Każdy drum staje się dziełem sztuki, które można dowolnie spersonalizować.",
          },
          {
            title: "Zastosowania",
            description:
              "Idealny do medytacji, muzykoterapii, relaksu, występów scenicznych i nauki muzyki. Używany przez terapeutów, muzyków i entuzjastów na całym świecie.",
          },
        ],
        galleryLabels: [
          "Wzór artystyczny — górski krajobraz",
          "Wzór górski — widok z góry",
          "Wzór artystyczny — koń",
          "Wzory metaliczne",
          "Wzór metaliczny — widok z góry",
          "Wzór artystyczny — mandala",
        ],
      },
    },
    events: {
      heading: "Nadchodzące wydarzenia",
      empty: "Aktualnie nie ma zaplanowanych wydarzeń. Sprawdź ponownie wkrótce!",
      free: "Bezpłatne",
      full: "Brak miejsc",
      register: "Zapisz się",
      startsAt: "Rozpoczęcie",
      seatsOf: "wolnych miejsc",
      seats: "miejsc",
      now: "Trwa teraz!",
      tomorrow: "Już jutro!",
      inHours: (h: number, m: number) => `Za ${h}h ${m}min`,
      inMinutes: (m: number) => `Za ${m} min`,
      inDays: (d: number) => `Za ${d} dni`,
      inWeek: "Za tydzień",
      inWeeks: (w: number) => `Za ${w} tygodnie`,
      inMonths: (m: number) => `Za ${m} mies.`,
    },
    about: {
      heading: "O nas",
      subtitle: "Justyna i Jarosław Drozd-Tietianiec",
      p1: "Jesteśmy wieloletnim zgranym małżeństwem i rodzicami trójki wspaniałych, dorosłych już dzieci. Od 2013 roku zajmujemy się tworzeniem Tank Drum-ów JDT i organizowaniem koncertów relaksacyjnych, korzystając z niespotykanych instrumentów. Jest to nasza pasja i hobby.",
      p2: "Do każdego instrumentu i wydarzenia podchodzimy indywidualnie. Każdy koncert jest niepowtarzalny i wyjątkowy. Cały czas się rozwijamy i poszerzamy repertuar. Ostatnio doszło ukulele, gitara i wokal oraz kolejny flet szamański.",
      jarek: "Jarosław to człowiek czynu — praktyczny, zaradny i nieustannie w ruchu. Samodzielnie zaprojektował i zamontował instalację fotowoltaiczną zasilającą nasz dom, a przy okazji jest domowym mechanikiem, elektrykiem i złotą rączką w jednym. Mechanika i elektryka to jego żywioł, a każda naprawa to dla niego wyzwanie, które musi zostać rozwiązane. Energia — w każdym jej wydaniu — jest tym, co go napędza.",
      justyna:
        "Justyna kocha przyrodę, naturę, relacje, harmonię i energię witalną. Na co dzień pani domu, mama, żona, ogrodniczka — znająca się na tutejszych ziołach. Lubi tworzyć sztukę, muzykę i ogród. Zgłębia rozwój duchowy: masaż, kod emocji, szamanizm, praca metageneologiczna z rodem, regresing, podróże prowadzone do nadświadomości.",
      photo: (i: number) => `Zdjęcie ${i + 1}`,
    },
    footer: {
      contact: "Kontakt",
      info: "Informacje",
      privacyLink: "Polityka prywatności",
    },
    privacy: {
      title: "Polityka prywatności",
      sections: [
        {
          heading: "1. Administrator danych",
          body: (name: string, address: string, email: string) =>
            `Administratorem Twoich danych osobowych jest ${name}, z siedzibą pod adresem: ${address}. Kontakt: ${email}.`,
        },
        {
          heading: "2. Cel przetwarzania danych",
          body: () =>
            "Twoje dane osobowe są przetwarzane w celu rejestracji na wydarzenia organizowane przez nas, wysyłki potwierdzeń rejestracji oraz komunikacji związanej z wydarzeniami.",
        },
        {
          heading: "3. Zakres zbieranych danych",
          body: () =>
            "Zbieramy następujące dane: imię i nazwisko, adres email, numer telefonu (opcjonalnie), liczbę rezerwowanych miejsc.",
        },
        {
          heading: "4. Podstawa prawna",
          body: () =>
            "Podstawą prawną przetwarzania danych jest Twoja zgoda (art. 6 ust. 1 lit. a RODO) oraz realizacja umowy (art. 6 ust. 1 lit. b RODO).",
        },
        {
          heading: "5. Twoje prawa",
          body: (_n: string, _a: string, email: string) =>
            `Masz prawo do dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych oraz wniesienia sprzeciwu. Aby skorzystać z tych praw, skontaktuj się z nami pod adresem: ${email}.`,
        },
        {
          heading: "6. Okres przechowywania",
          body: () =>
            "Dane będą przechowywane przez okres niezbędny do realizacji celów, dla których zostały zebrane, nie dłużej niż 2 lata od daty wydarzenia.",
        },
        {
          heading: "7. Kontakt",
          body: (_n: string, _a: string, email: string, phone: string) =>
            `W sprawach dotyczących ochrony danych osobowych prosimy o kontakt: ${email}, tel. ${phone}.`,
        },
      ],
    },
  },

  en: {
    nav: {
      home: "Home",
      contact: "Contact",
    },
    hero: {
      description: "Relaxation Concerts",
      cta: "See Events",
    },
    concerts: {
      heading: "Concerts You Feel",
      body: "This is not an ordinary concert. It's an experience that lets you stop, breathe, and feel the harmony of sound. Every gathering is a moment just for you — no rush, no noise, no expectations.",
      features: [
        {
          title: "Live Sound",
          description: "Live concerts using relaxation instruments.",
        },
        {
          title: "Deep Relaxation",
          description: "Low frequencies reduce stress and calm the mind.",
        },
        {
          title: "Time for Yourself",
          description: "Time to breathe, unwind, and regenerate in an intimate atmosphere.",
        },
      ],
    },
    drum: {
      label: "Premium Instrument",
      heading: "Discover the Tank Drum",
      playBtn: "Play",
      learnBtn: "Learn More",
      backBtn: "← Back",
      features: [
        {
          title: "Handcrafted",
          description: "Every instrument is hand-tuned and finished with attention to every detail.",
        },
        {
          title: "Relaxing Sound",
          description: "Warm, resonant tones help you unwind and relax after a long day.",
        },
        {
          title: "For Everyone",
          description: "No musical experience needed — just touch it and play.",
        },
      ],
      songs: ["Twinkle Twinkle", "Ode to Joy", "Meditation"],
      detail: {
        label: "Details",
        titleSuffix: "— a closer look",
        gallery: "Gallery",
        orders: "Completed orders",
        info: [
          {
            title: "Material & Construction",
            description:
              "Made from high-quality steel, shaped and hand-tuned. The thickness and shape of each tongue affects the tone and sustain of the sound.",
          },
          {
            title: "Tuning & Scales",
            description:
              "Available in various musical scales — pentatonic, major, minor and many others. Each instrument is precisely tuned with a chromatic tuner.",
          },
          {
            title: "Artistic Patterns",
            description:
              "We create unique custom patterns — geometric, organic, mandalas and more. Each drum becomes a work of art that can be fully personalized.",
          },
          {
            title: "Applications",
            description:
              "Perfect for meditation, music therapy, relaxation, stage performances and music learning. Used by therapists, musicians, and enthusiasts worldwide.",
          },
        ],
        galleryLabels: [
          "Artistic pattern — mountain landscape",
          "Mountain pattern — top view",
          "Artistic pattern — horse",
          "Metallic patterns",
          "Metallic pattern — top view",
          "Artistic pattern — mandala",
        ],
      },
    },
    events: {
      heading: "Upcoming Events",
      empty: "No events are currently scheduled. Check back soon!",
      free: "Free",
      full: "Sold Out",
      register: "Register",
      startsAt: "Starts at",
      seatsOf: "seats available",
      seats: "seats",
      now: "Happening now!",
      tomorrow: "Tomorrow!",
      inHours: (h: number, m: number) => `In ${h}h ${m}min`,
      inMinutes: (m: number) => `In ${m} min`,
      inDays: (d: number) => `In ${d} days`,
      inWeek: "In a week",
      inWeeks: (w: number) => `In ${w} weeks`,
      inMonths: (m: number) => `In ${m} mo.`,
    },
    about: {
      heading: "About Us",
      subtitle: "Justyna & Jarosław Drozd-Tietianiec",
      p1: "We are a long-married couple and parents of three wonderful, now-adult children. Since 2013 we have been crafting JDT Tank Drums and organising relaxation concerts using extraordinary instruments. It is our passion and hobby.",
      p2: "We approach every instrument and event individually. Every concert is unique and one-of-a-kind. We are constantly growing and expanding our repertoire — recently adding ukulele, guitar, vocals, and another shamanic flute.",
      jarek: "Jarosław is a man of action — practical, resourceful, and always on the move. He designed and installed the solar power system for our home and serves as the household mechanic, electrician, and handyman all in one. Mechanics and electronics are his element, and every repair is a challenge he must solve. Energy — in every form — is what drives him.",
      justyna:
        "Justyna loves nature, relationships, harmony, and vital energy. A homemaker, mother, wife, and gardener who knows the local herbs. She loves creating art, music, and gardens. She explores spiritual growth: massage, emotional code, shamanism, metagenealogical family work, regression, and journeys into higher consciousness.",
      photo: (i: number) => `Photo ${i + 1}`,
    },
    footer: {
      contact: "Contact",
      info: "Information",
      privacyLink: "Privacy Policy",
    },
    privacy: {
      title: "Privacy Policy",
      sections: [
        {
          heading: "1. Data Controller",
          body: (name: string, address: string, email: string) =>
            `The data controller is ${name}, with registered address: ${address}. Contact: ${email}.`,
        },
        {
          heading: "2. Purpose of Processing",
          body: () =>
            "Your personal data is processed for the purpose of registration for events organised by us, sending registration confirmations, and event-related communication.",
        },
        {
          heading: "3. Scope of Data Collected",
          body: () =>
            "We collect the following data: full name, email address, phone number (optional), number of seats reserved.",
        },
        {
          heading: "4. Legal Basis",
          body: () =>
            "The legal basis for processing is your consent (Art. 6(1)(a) GDPR) and the performance of a contract (Art. 6(1)(b) GDPR).",
        },
        {
          heading: "5. Your Rights",
          body: (_n: string, _a: string, email: string) =>
            `You have the right to access, rectify, erase, restrict processing, port your data, and object to processing. To exercise these rights, contact us at: ${email}.`,
        },
        {
          heading: "6. Retention Period",
          body: () =>
            "Data will be retained for the period necessary to fulfil the purposes for which it was collected, no longer than 2 years from the event date.",
        },
        {
          heading: "7. Contact",
          body: (_n: string, _a: string, email: string, phone: string) =>
            `For matters related to personal data protection, please contact us at: ${email}, tel. ${phone}.`,
        },
      ],
    },
  },
} as const;

export type T = typeof translations.pl;
