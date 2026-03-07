import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqItem } from "@/types";

interface FaqProps {
  items: FaqItem[];
}

export function Faq({ items }: FaqProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-2xl font-bold mb-6">Najczęściej zadawane pytania</h2>
        <Accordion type="single" collapsible className="w-full">
          {items.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {item.question}
              </AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
