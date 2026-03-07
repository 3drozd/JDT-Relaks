import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ConfirmationEmailProps {
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

export function ConfirmationEmail({
  participantName,
  eventName,
  eventDate,
  eventLocation,
  seats,
  price,
  calendarUrl,
  organizerEmail,
  organizerName,
}: ConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Potwierdzenie rejestracji - {eventName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Potwierdzenie rejestracji</Heading>

          <Text style={text}>Cześć {participantName}!</Text>

          <Text style={text}>
            Twoja rejestracja na wydarzenie <strong>{eventName}</strong> została
            potwierdzona.
          </Text>

          <Section style={detailsBox}>
            <Text style={detailItem}>
              <strong>Wydarzenie:</strong> {eventName}
            </Text>
            <Text style={detailItem}>
              <strong>Data:</strong> {eventDate}
            </Text>
            <Text style={detailItem}>
              <strong>Miejsce:</strong> {eventLocation}
            </Text>
            <Text style={detailItem}>
              <strong>Liczba miejsc:</strong> {seats}
            </Text>
            <Text style={detailItem}>
              <strong>Cena:</strong> {price || "Bezpłatne"}
            </Text>
          </Section>

          <Section style={{ textAlign: "center" as const, margin: "32px 0" }}>
            <Button style={calendarButton} href={calendarUrl}>
              Dodaj do kalendarza
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footerText}>
            Masz pytania? Napisz do nas:{" "}
            <a href={`mailto:${organizerEmail}`} style={link}>
              {organizerEmail}
            </a>
          </Text>

          <Text style={footerText}>
            Pozdrawiamy,
            <br />
            {organizerName}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
  borderRadius: "8px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold" as const,
  textAlign: "center" as const,
  color: "#1a1a1a",
  margin: "0 0 24px",
};

const text = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#333",
  margin: "0 0 16px",
};

const detailsBox = {
  backgroundColor: "#f4f4f5",
  borderRadius: "8px",
  padding: "20px",
  margin: "16px 0",
};

const detailItem = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#333",
  margin: "0 0 4px",
};

const calendarButton = {
  backgroundColor: "#2563eb",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold" as const,
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const iosNote = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "#8898aa",
  textAlign: "center" as const,
  margin: "12px 0 0",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "24px 0",
};

const footerText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#8898aa",
  margin: "0 0 8px",
};

const link = {
  color: "#2563eb",
  textDecoration: "underline",
};
