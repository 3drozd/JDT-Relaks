import Image from "next/image";

export function AboutUs() {
  return (
    <section id="o-nas" className="border-t bg-muted/50" data-snap>
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-2">O nas</h2>
        <p className="text-center text-muted-foreground text-sm mb-12">Justyna i Jarosław Drozd-Tietianiec</p>

        {/* Wspólny opis */}
        <div className="max-w-3xl mx-auto mb-14 space-y-4 text-muted-foreground text-sm leading-relaxed">
          <p>
            Jesteśmy wieloletnim zgranym małżeństwem i rodzicami trójki wspaniałych, dorosłych już dzieci.
            Od 2013 roku zajmujemy się tworzeniem Tank Drum-ów JDT i organizowaniem koncertów relaksacyjnych,
            korzystając z niespotykanych instrumentów. Jest to nasza pasja i hobby.
          </p>
          <p>
            Do każdego instrumentu i wydarzenia podchodzimy indywidualnie.
            Każdy koncert jest niepowtarzalny i wyjątkowy.
            Cały czas się rozwijamy i poszerzamy repertuar.
            Ostatnio doszło ukulele, gitara i wokal oraz kolejny flet szamański.
          </p>
        </div>

        {/* Galeria wspólna */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-16">
          {[
            "/images/1772894121850.jpg",
            "/images/1772894121935.jpeg",
            "/images/1772906797440.jpg",
            "/images/1772909471977 (1).jpeg",
          ].map((src, i) => (
            <div key={i} className="aspect-square rounded-xl overflow-hidden border border-border relative">
              <Image src={src} alt={`Zdjęcie ${i + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>

        {/* Indywidualne opisy */}
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-10 items-start">
          <div className="w-full md:w-64 shrink-0 aspect-[3/4] rounded-2xl overflow-hidden border border-border relative">
            <Image src="/images/Justyna I Jarek.jpeg" alt="Justyna i Jarosław" fill className="object-cover" />
          </div>
          <div className="flex flex-col gap-10 flex-1">
            {/* Jarek */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Jarosław</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Jarosław to człowiek czynu — praktyczny, zaradny i nieustannie w ruchu. Samodzielnie zaprojektował
                i zamontował instalację fotowoltaiczną zasilającą nasz dom, a przy okazji jest domowym mechanikiem,
                elektrykiem i złotą rączką w jednym. Mechanika i elektryka to jego żywioł, a każda naprawa to
                dla niego wyzwanie, które musi zostać rozwiązane. Energia — w każdym jej wydaniu — jest tym,
                co go napędza.
              </p>
            </div>

            {/* Justyna */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Justyna</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Justyna kocha przyrodę, naturę, relacje, harmonię i energię witalną.
                Na co dzień pani domu, mama, żona, ogrodniczka — znająca się na tutejszych ziołach.
                Lubi tworzyć sztukę, muzykę i ogród. Zgłębia rozwój duchowy: masaż, kod emocji, szamanizm,
                praca metageneologiczna z rodem, regresing, podróże prowadzone do nadświadomości.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
