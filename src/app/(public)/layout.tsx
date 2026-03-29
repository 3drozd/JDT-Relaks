import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { PageTransition } from "@/components/layout/page-transition";
import { DevPanelLoader } from "@/components/dev/dev-panel-loader";
import { AboutUs } from "@/components/sections/about-us";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-svh overflow-y-auto" data-scroll-container>
      <ScrollToTop />
      <Header />
      <main>
        <PageTransition>{children}</PageTransition>
      </main>
      <AboutUs />
      <Footer />
      <DevPanelLoader />
    </div>
  );
}
