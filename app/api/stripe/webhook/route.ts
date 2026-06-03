import {NextResponse} from "next/server";
import {revalidateTag} from "next/cache";
import {cacheTags} from "@/lib/cache-tags";
import {prisma} from "@/lib/prisma";
import {verifyStripeWebhookSignature} from "@/lib/stripe";

export const runtime = "nodejs";

type StripeCheckoutCompletedEvent = {
  type: string;
  data: {
    object: {
      id: string;
      payment_status?: string;
      payment_intent?: string;
      metadata?: {
        solicitudId?: string;
      };
    };
  };
};

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ ok: false, error: "Falta firma." }, { status: 400 });
  }

  try {
    verifyStripeWebhookSignature(payload, signature);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Firma no valida.",
      },
      { status: 400 },
    );
  }

  const event = JSON.parse(payload) as StripeCheckoutCompletedEvent;

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    if (session.payment_status === "paid") {
      await prisma.solicitud_alta.updateMany({
        where: {
          stripeCheckoutSessionId: session.id,
        },
        data: {
          estado: "pago_confirmado",
          fechaPago: new Date(),
          stripePaymentIntentId: session.payment_intent || null,
        },
      });
        revalidateTag(cacheTags.solicitudesAlta, "max");
    }
  }

  return NextResponse.json({ received: true });
}
