import { render } from "@react-email/render";
import { ConfirmationEmail } from "@/components/email/confirmation";

interface RenderEmailProps {
  participantName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  seats: number;
  price: string | null;
  calendarUrl: string;
  organizerEmail: string;
  organizerName: string;
}

export async function renderConfirmationEmail(
  props: RenderEmailProps
): Promise<string> {
  const html = await render(
    <ConfirmationEmail {...props} />
  );
  return html;
}
