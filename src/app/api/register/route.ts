import { NextRequest, NextResponse } from "next/server";
import { registrationSchema } from "@/lib/validators";
import { createServerClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { siteConfig } from "@/config/site.config";
import { sendConfirmationEmail } from "@/lib/send-confirmation";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { success } = rateLimit(ip, siteConfig.rateLimit.maxPerMinute);
  if (!success) {
    return NextResponse.json(
      { message: "Zbyt wiele prób. Spróbuj ponownie za minutę." },
      { status: 429 }
    );
  }

  // Parse and validate body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Nieprawidłowe dane." },
      { status: 400 }
    );
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Nieprawidłowe dane";
    return NextResponse.json({ message: firstError }, { status: 400 });
  }

  const { eventId, name, email, phone, seats, rodoConsent } = parsed.data;

  const supabase = createServerClient();

  // Fetch event to check payment type
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (!event) {
    return NextResponse.json(
      { message: "Wydarzenie nie zostało znalezione." },
      { status: 404 }
    );
  }

  const isOnlinePayment = event.payment_type === "online";

  // Atomic registration via RPC
  const { data: registrationId, error: rpcError } = await supabase.rpc(
    "register_for_event",
    {
      p_event_id: eventId,
      p_name: name,
      p_email: email,
      p_phone: phone || null,
      p_seats: seats,
      p_rodo_consent: rodoConsent,
      p_payment_status: isOnlinePayment ? "pending" : "not_required",
      p_stripe_session_id: null,
    }
  );

  if (rpcError) {
    const message = rpcError.message;
    if (message.includes("EVENT_NOT_FOUND")) {
      return NextResponse.json(
        { message: "Wydarzenie nie zostało znalezione." },
        { status: 404 }
      );
    }
    if (message.includes("EVENT_NOT_ACTIVE")) {
      return NextResponse.json(
        { message: "Rejestracja na to wydarzenie jest zamknięta." },
        { status: 409 }
      );
    }
    if (message.includes("NO_SEATS_AVAILABLE")) {
      return NextResponse.json(
        { message: "Brak wolnych miejsc na to wydarzenie." },
        { status: 409 }
      );
    }
    console.error("Registration RPC error:", rpcError);
    return NextResponse.json(
      { message: "Wystąpił błąd podczas rejestracji. Spróbuj ponownie." },
      { status: 500 }
    );
  }

  // Online payment: create Stripe Checkout session
  if (isOnlinePayment && event.price_amount) {
    try {
      const totalAmount = event.price_amount * seats;
      const { sessionId: stripeSessionId, url: paymentUrl } =
        await createCheckoutSession({
          registrationId,
          amount: totalAmount,
          eventName: `${event.name} (${seats}x)`,
          customerEmail: email,
          successUrl: `${siteConfig.url}/events/${event.slug}?payment=success`,
          cancelUrl: `${siteConfig.url}/events/${event.slug}?payment=cancelled`,
        });

      // Store Stripe session ID
      await supabase
        .from("registrations")
        .update({ stripe_session_id: stripeSessionId })
        .eq("id", registrationId);

      return NextResponse.json({
        success: true,
        paymentUrl,
        message: "Przekierowanie do płatności...",
      });
    } catch (paymentError) {
      console.error("Stripe session error:", paymentError);
      await supabase
        .from("registrations")
        .update({ payment_status: "failed" })
        .eq("id", registrationId);
      return NextResponse.json(
        { message: "Błąd inicjalizacji płatności. Spróbuj ponownie." },
        { status: 500 }
      );
    }
  }

  // Free/on_site: send confirmation email immediately
  try {
    await sendConfirmationEmail({
      registrationId,
      name,
      email,
      seats,
      event,
    });
  } catch (emailError) {
    console.error("Email send error:", emailError);
  }

  // Optional webhook
  if (siteConfig.webhookUrl) {
    fetch(siteConfig.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "registration",
        data: { registrationId, eventId, name, email, phone, seats },
      }),
    }).catch(() => {});
  }

  return NextResponse.json({
    success: true,
    message: "Rejestracja zapisana pomyślnie!",
  });
}
