import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScrollToTop } from "@/components/layout/scroll-to-top";
import { PageTransition } from "@/components/layout/page-transition";
import { FullpageScroll } from "@/components/layout/fullpage-scroll";
import { DevPanelLoader } from "@/components/dev/dev-panel-loader";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <FullpageScroll />
      <Header />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <DevPanelLoader />
    </div>
  );
}
