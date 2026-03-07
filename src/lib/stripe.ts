import Stripe from "stripe";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "Stripe not configured. Set STRIPE_SECRET_KEY env var."
    );
  }
  return new Stripe(secretKey);
}

export async function createCheckoutSession(params: {
  registrationId: string;
  amount: number; // in grosze (smallest currency unit)
  currency?: string;
  eventName: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ sessionId: string; url: string }> {
  const stripe = getStripe();
  const currency = params.currency || "pln";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card", "blik", "p24"],
    mode: "payment",
    customer_email: params.customerEmail,
    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: params.eventName,
          },
          unit_amount: params.amount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      registration_id: params.registrationId,
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });

  return {
    sessionId: session.id,
    url: session.url!,
  };
}

export async function constructWebhookEvent(
  body: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  const stripe = getStripe();
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!endpointSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET not configured.");
  }
  return stripe.webhooks.constructEvent(body, signature, endpointSecret);
}
