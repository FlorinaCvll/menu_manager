import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { retrieveStripeCheckoutSession } from "@/lib/stripe";

export default async function AltaSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  let pagoVerificado = false;
  let aviso = "";

  if (params.session_id) {
    try {
      const session = await retrieveStripeCheckoutSession(params.session_id);

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
        pagoVerificado = true;
      } else {
        aviso = "Stripe ha devuelto la sesión, pero el pago todavía no figura como completado.";
      }
    } catch {
      aviso = "No se ha podido verificar el pago automáticamente. Revisaremos la solicitud desde administración.";
    }
  } else {
    aviso = "No se ha recibido una sesión de Stripe para verificar el pago.";
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-12">
      <section className="paper-panel rounded-[2rem] p-8">
        <p className="paper-tag">
          {pagoVerificado ? "Pago verificado" : "Pago recibido"}
        </p>
        <h1 className="section-title mt-4 text-4xl font-semibold text-stone-900">
          Solicitud enviada para validación
        </h1>
        <p className="mt-4 text-sm leading-7 text-stone-700">
          El pago se ha completado correctamente. Nuestro equipo revisará la
          documentación aportada y activará el negocio cuando la validación sea
          favorable.
        </p>
        {aviso ? (
          <p className="mt-5 border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
            {aviso}
          </p>
        ) : null}
        {pagoVerificado ? (
          <div className="mt-5 border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-950">
            <p className="font-semibold">Pago confirmado correctamente.</p>
            <p className="mt-2">
              Cuando la documentación sea aprobada, podrás iniciar sesión con el
              CIF/NIF de la empresa, tu ID de usuario y el PIN indicado durante
              el alta.
            </p>
          </div>
        ) : null}
        <Link href="/login" className="primary-button mt-6">
          Ir al acceso
        </Link>
      </section>
    </main>
  );
}
