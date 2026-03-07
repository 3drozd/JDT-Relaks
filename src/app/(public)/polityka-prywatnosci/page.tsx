import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: "Polityka prywatności",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Polityka prywatności</h1>

      <div className="prose prose-neutral max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">
            1. Administrator danych
          </h2>
          <p className="text-muted-foreground">
            Administratorem Twoich danych osobowych jest{" "}
            {siteConfig.organizer.name}, z siedzibą pod adresem:{" "}
            {siteConfig.organizer.address}. Kontakt:{" "}
            {siteConfig.organizer.email}.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            2. Cel przetwarzania danych
          </h2>
          <p className="text-muted-foreground">
            Twoje dane osobowe są przetwarzane w celu rejestracji na wydarzenia
            organizowane przez nas, wysyłki potwierdzeń rejestracji oraz
            komunikacji związanej z wydarzeniami.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            3. Zakres zbieranych danych
          </h2>
          <p className="text-muted-foreground">
            Zbieramy następujące dane: imię i nazwisko, adres email, numer
            telefonu (opcjonalnie), liczbę rezerwowanych miejsc.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            4. Podstawa prawna
          </h2>
          <p className="text-muted-foreground">
            Podstawą prawną przetwarzania danych jest Twoja zgoda (art. 6 ust. 1
            lit. a RODO) oraz realizacja umowy (art. 6 ust. 1 lit. b RODO).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Twoje prawa</h2>
          <p className="text-muted-foreground">
            Masz prawo do dostępu do swoich danych, ich sprostowania, usunięcia,
            ograniczenia przetwarzania, przenoszenia danych oraz wniesienia
            sprzeciwu. Aby skorzystać z tych praw, skontaktuj się z nami pod
            adresem: {siteConfig.organizer.email}.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            6. Okres przechowywania
          </h2>
          <p className="text-muted-foreground">
            Dane będą przechowywane przez okres niezbędny do realizacji celów, dla
            których zostały zebrane, nie dłużej niż 2 lata od daty wydarzenia.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Kontakt</h2>
          <p className="text-muted-foreground">
            W sprawach dotyczących ochrony danych osobowych prosimy o kontakt:{" "}
            {siteConfig.organizer.email}, tel. {siteConfig.organizer.phone}.
          </p>
        </section>
      </div>
    </div>
  );
}
