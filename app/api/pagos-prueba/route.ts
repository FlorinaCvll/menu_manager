import {NextResponse} from "next/server";
import {revalidateTag} from "next/cache";
import {jsonError} from "@/lib/api";
import {cacheTags} from "@/lib/cache-tags";
import {prisma} from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const idSolicitudAlta = Number(body.idSolicitudAlta);

  if (!idSolicitudAlta) {
    return jsonError("Solicitud no valida.");
  }

  const solicitud = await prisma.solicitud_alta.findUnique({
    where: {
      idSolicitudAlta,
    },
  });

  if (!solicitud) {
    return jsonError("Solicitud no encontrada.", 404);
  }

  if (solicitud.estado !== "pendiente_pago") {
    return NextResponse.json({ ok: true, item: solicitud });
  }

  const actualizada = await prisma.solicitud_alta.update({
    where: {
      idSolicitudAlta,
    },
    data: {
      estado: "pago_confirmado",
      fechaPago: new Date(),
      stripePaymentIntentId: `pago_prueba_${idSolicitudAlta}_${Date.now()}`,
    },
  });

  revalidateTag(cacheTags.solicitudesAlta, "max");
  return NextResponse.json({ ok: true, item: actualizada });
}
