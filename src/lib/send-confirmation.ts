import { createServerClient } from "@/lib/supabase/server";
import { getResend } from "@/lib/resend";
import { siteConfig } from "@/config/site.config";
import { renderConfirmationEmail } from "@/lib/email-renderer";
import { formatDate } from "@/lib/format";
import { generateIcsContent } from "@/lib/google-calendar";
import type { Event } from "@/types";

export async function sendConfirmationEmail(params: {
  registrationId: string;
  name: string;
  email: string;
  seats: number;
  event: Event;
}): Promise<void> {
  const { registrationId, name, email, seats, event } = params;
  const calendarUrl = `${siteConfig.url}/api/calendar/${event.id}`;

  const emailHtml = await renderConfirmationEmail({
    participantName: name,
    eventName: event.name,
    eventDate: formatDate(event.date),
    eventLocation: event.location,
    seats,
    price: event.price,
    calendarUrl,
    organizerEmail: siteConfig.organizer.email,
    organizerName: siteConfig.organizer.name,
  });

  const icsContent = generateIcsContent(event);

  await getResend().emails.send({
    from: siteConfig.email.from,
    to: email,
    replyTo: siteConfig.email.replyTo,
    subject: `Potwierdzenie rejestracji - ${event.name}`,
    html: emailHtml,
    attachments: [
      {
        filename: "event.ics",
        content: Buffer.from(icsContent),
      },
    ],
  });

  const supabase = createServerClient();
  await supabase
    .from("registrations")
    .update({ confirmation_sent: true })
    .eq("id", registrationId);
}
