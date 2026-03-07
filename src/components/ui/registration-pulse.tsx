"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

interface RegistrationPulseProps {
  trigger: number | null;
  className?: string;
}

export function RegistrationPulse({
  trigger,
  className,
}: RegistrationPulseProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    setVisible(true);
    const timeout = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timeout);
  }, [trigger]);

  return (
    <div className={`h-5 ${className ?? ""}`}>
      <div
        className={`flex items-center gap-1.5 text-xs font-medium text-green-600 transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <Sparkles className="h-3 w-3 animate-pulse" />
        <span>Ktoś właśnie dokonał rezerwacji!</span>
      </div>
    </div>
  );
}
