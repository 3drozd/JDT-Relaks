"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface DetailedDescriptionProps {
  text: string;
}

export function DetailedDescription({ text }: DetailedDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const paragraphs = text.split("\n").filter(Boolean);

  return (
    <div className="container mx-auto px-4 max-w-3xl -mt-4">
      <div className="rounded-lg border bg-card shadow-sm">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-center gap-2 px-4 py-2.5 text-left"
        >
          <span className="text-base font-semibold">Szczegóły wydarzenia</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <div className="px-4 pb-3">
              <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
                {paragraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
