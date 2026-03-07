import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site.config";

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20 md:py-32">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          {siteConfig.name}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl">
          {siteConfig.description}
        </p>
        <div className="mt-8">
          <Button asChild size="lg" className="text-lg px-8">
            <a href="#wydarzenia">Zobacz wydarzenia</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
