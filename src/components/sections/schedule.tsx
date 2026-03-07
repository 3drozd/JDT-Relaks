import { Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { ScheduleItem } from "@/types";

interface ScheduleProps {
  schedule: ScheduleItem[] | null;
}

export function Schedule({ schedule }: ScheduleProps) {
  if (!schedule || schedule.length === 0) return null;

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-2xl font-bold mb-8">Harmonogram</h2>
        <div className="space-y-0">
          {schedule.map((item, index) => (
            <div key={index}>
              {index > 0 && <Separator className="my-4" />}
              <div className="flex gap-4">
                <div className="flex items-start gap-2 min-w-[80px] text-primary font-semibold">
                  <Clock className="h-4 w-4 mt-1 shrink-0" />
                  <span>{item.time}</span>
                </div>
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
