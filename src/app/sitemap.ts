import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site.config";
import { getActiveEvents } from "@/lib/supabase/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getActiveEvents();

  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...events.map((event) => ({
      url: `${siteConfig.url}/events/${event.slug}`,
      lastModified: new Date(event.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
