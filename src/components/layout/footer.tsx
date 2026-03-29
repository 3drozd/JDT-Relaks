import Link from "next/link";
import { siteConfig } from "@/config/site.config";

export function Footer() {
  return (
    <footer id="kontakt" className="border-t bg-muted/50" data-snap>
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Firma */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{siteConfig.name}</h3>
            <p className="text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Tank Drum</p>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Kontakt</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>{siteConfig.organizer.name}</li>
              <li>
                <a
                  href={`mailto:${siteConfig.organizer.email}`}
                  className="hover:text-foreground transition-colors"
                >
                  {siteConfig.organizer.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${siteConfig.organizer.phone}`}
                  className="hover:text-foreground transition-colors"
                >
                  {siteConfig.organizer.phone}
                </a>
              </li>
              <li>{siteConfig.organizer.address}</li>
            </ul>
          </div>

          {/* Linki */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Informacje</h3>
            <ul className="space-y-2 text-sm">
              {siteConfig.footer.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          {siteConfig.footer.copyright}
        </div>
      </div>
    </footer>
  );
}
