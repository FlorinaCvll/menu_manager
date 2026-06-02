import crypto from "crypto";

type CheckoutSessionInput = {
  solicitudId: number;
  email: string;
  nombreRestaurante: string;
  origin: string;
};

type StripeCheckoutSession = {
  id: string;
  url: string | null;
  payment_status?: string;
  payment_intent?: string;
  metadata?: {
    solicitudId?: string;
  };
};

export function getStripeConfig() {
  return {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    priceId: process.env.STRIPE_PRICE_ID,
    amountCents: Number(process.env.STRIPE_AMOUNT_CENTS || "9900"),
  };
}

export async function createStripeCheckoutSession({
  solicitudId,
  email,
  nombreRestaurante,
  origin,
}: CheckoutSessionInput) {
  const { secretKey, priceId, amountCents } = getStripeConfig();

  if (!secretKey) {
    throw new Error("Falta STRIPE_SECRET_KEY.");
  }

  const body = new URLSearchParams({
    mode: "payment",
    client_reference_id: String(solicitudId),
    customer_email: email,
    success_url: `${origin}/alta/success?solicitud=${solicitudId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/alta/cancel?solicitud=${solicitudId}`,
    "metadata[solicitudId]": String(solicitudId),
    "line_items[0][quantity]": "1",
  });

  if (priceId) {
    body.set("line_items[0][price]", priceId);
  } else {
    body.set("line_items[0][price_data][currency]", "eur");
    body.set("line_items[0][price_data][unit_amount]", String(amountCents));
    body.set(
      "line_items[0][price_data][product_data][name]",
      `Alta MenuManager - ${nombreRestaurante}`,
    );
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = (await response.json()) as StripeCheckoutSession & {
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(data.error?.message || "Stripe no ha creado el checkout.");
  }

  if (!data.url) {
    throw new Error("Stripe no ha devuelto una URL de pago.");
  }

  return data;
}

export async function retrieveStripeCheckoutSession(sessionId: string) {
  const { secretKey } = getStripeConfig();

  if (!secretKey) {
    throw new Error("Falta STRIPE_SECRET_KEY.");
  }

  const response = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
      cache: "no-store",
    },
  );

  const data = (await response.json()) as StripeCheckoutSession & {
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(data.error?.message || "No se ha podido verificar el pago.");
  }

  return data;
}

export function shouldUseMockPayments() {
  return process.env.PAYMENT_PROVIDER !== "stripe";
}

export function verifyStripeWebhookSignature(payload: string, signature: string) {
  const { webhookSecret } = getStripeConfig();

  if (!webhookSecret) {
    throw new Error("Falta STRIPE_WEBHOOK_SECRET.");
  }

  const parts = signature.split(",").reduce<Record<string, string[]>>(
    (current, part) => {
      const [key, value] = part.split("=");
      if (!key || !value) {
        return current;
      }

      current[key] = [...(current[key] || []), value];
      return current;
    },
    {},
  );

  const timestamp = parts.t?.[0];
  const signatures = parts.v1 || [];

  if (!timestamp || signatures.length === 0) {
    throw new Error("Firma de Stripe incompleta.");
  }

  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex");

  const expectedBuffer = Buffer.from(expected);
  const valid = signatures.some((item) => {
    const receivedBuffer = Buffer.from(item);
    return (
      receivedBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
    );
  });

  if (!valid) {
    throw new Error("Firma de Stripe no válida.");
  }
}
