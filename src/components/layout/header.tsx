"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";


const navLinks = [
  { label: "Strona główna", href: "/" },
  { label: "Kontakt", href: "#kontakt" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const container = document.querySelector("[data-scroll-container]");
    const target = container || window;
    const onScroll = () => {
      const scrollY = container ? container.scrollTop : window.scrollY;
      setScrolled(scrollY > 50);
    };
    onScroll();
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (href === "/" && pathname === "/") {
        e.preventDefault();
        const container = document.querySelector("[data-scroll-container]");
        if (container) {
          container.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else if (href === "#kontakt") {
        e.preventDefault();
        const container = document.querySelector("[data-scroll-container]");
        const target = document.getElementById("kontakt");
        if (container && target) {
          container.scrollTo({ top: target.offsetTop, behavior: "smooth" });
        } else {
          target?.scrollIntoView({ behavior: "smooth" });
        }
      }
      setOpen(false);
    },
    [pathname]
  );

  return (
    <header
      className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow duration-500"
      style={{ boxShadow: "0 8px 30px 4px rgba(255,255,255,0.15), 0 2px 12px rgba(255,255,255,0.1)" }}
    >
      <div className="container mx-auto flex h-12 items-center justify-between px-4">
        <Link href="/" className="flex items-baseline text-xl font-bold text-primary">
          <span>JDT</span>
          <span
            className="inline-block overflow-hidden text-xl font-normal text-primary/50 transition-all duration-500 ease-out"
            style={{
              maxWidth: scrolled ? "8rem" : "0",
              opacity: scrolled ? 1 : 0,
            }}
          >
            &nbsp;Relaks
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] flex flex-col">
            <SheetTitle className="sr-only">Menu nawigacji</SheetTitle>
            <div className="mt-12 flex flex-col items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="w-full text-center py-4 text-xl font-medium text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
