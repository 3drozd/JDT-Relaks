"use client";

import { siteConfig } from "@/config/site.config";
import { useLanguage } from "@/contexts/language-context";

export default function PrivacyPolicyPage() {
  const { t } = useLanguage();
  const { name, address, email, phone } = siteConfig.organizer;

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">{t.privacy.title}</h1>

      <div className="prose prose-neutral max-w-none space-y-6">
        {t.privacy.sections.map((section, i) => (
          <section key={i}>
            <h2 className="text-xl font-semibold mb-3">{section.heading}</h2>
            <p className="text-muted-foreground">
              {section.body(name, address ?? "", email, phone ?? "")}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
