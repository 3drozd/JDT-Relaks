import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@/lib/supabase/server";
import { constructWebhookEvent } from "@/lib/stripe";
import { sendConfirmationEmail } from "@/lib/send-confirmation";
import { siteConfig } from "@/config/site.config";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = await constructWebhookEvent(body, signature);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const registrationId = session.metadata?.registration_id;

    if (!registrationId) {
      console.error("Stripe webhook: no registration_id in metadata");
      return NextResponse.json({ error: "No registration_id" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Check if already processed (idempotent)
    const { data: registration } = await supabase
      .from("registrations")
      .select("*, events(*)")
      .eq("id", registrationId)
      .single();

    if (!registration) {
      console.error("Stripe webhook: registration not found", registrationId);
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (registration.payment_status === "paid") {
      return NextResponse.json({ status: "already_processed" });
    }

    // Mark as paid
    await supabase
      .from("registrations")
      .update({
        payment_status: "paid",
        stripe_payment_id: session.payment_intent as string,
        paid_at: new Date().toISOString(),
      })
      .eq("id", registrationId);

    // Send confirmation email
    if (registration.events) {
      try {
        await sendConfirmationEmail({
          registrationId: registration.id,
          name: registration.name,
          email: registration.email,
          seats: registration.seats,
          event: registration.events,
        });
      } catch (emailError) {
        console.error("Stripe webhook: email send error", emailError);
      }
    }

    // Optional webhook
    if (siteConfig.webhookUrl) {
      fetch(siteConfig.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "payment_confirmed",
          data: {
            registrationId: registration.id,
            eventId: registration.event_id,
            paymentIntent: session.payment_intent,
            amount: session.amount_total,
          },
        }),
      }).catch(() => {});
    }
  }

  return NextResponse.json({ received: true });
}
