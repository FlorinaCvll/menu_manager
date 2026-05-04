import { NextResponse } from "next/server";
import { jsonError, requireApiSession } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { error } = await requireApiSession(["superadmin"]);

  if (error) {
    return error;
  }

  const { id } = await context.params;
  const idSolicitudAlta = Number(id);
  const body = await request.json();
  const accion = String(body.accion || "");

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

  if (accion === "rechazar") {
    const actualizada = await prisma.solicitud_alta.update({
      where: {
        idSolicitudAlta,
      },
      data: {
        estado: "rechazada",
        fechaRevision: new Date(),
        motivoRechazo: body.motivoRechazo || null,
      },
    });

    return NextResponse.json({ ok: true, item: actualizada });
  }

  if (accion !== "aprobar") {
    return jsonError("Accion no valida.");
  }

  if (solicitud.estado !== "pago_confirmado") {
    return jsonError("Solo se puede aprobar una solicitud con pago confirmado.");
  }

  if (solicitud.idNegocioCreado || solicitud.idPersonaAdminCreada) {
    return jsonError("Esta solicitud ya fue activada.");
  }

  const resultado = await prisma.$transaction(async (tx) => {
    const negocio = await tx.negocio.create({
      data: {
        nombre: solicitud.nombreRestaurante,
        direccion: solicitud.direccion,
        telefono: solicitud.telefono,
        estado: "activo",
        fechaAlta: new Date(),
        CIF_NIF: solicitud.CIF_NIF,
        documentoPropiedadUrl: solicitud.documentoPropiedadUrl,
      },
    });

    const persona = await tx.persona.create({
      data: {
        nombre: solicitud.personaContacto,
        telefono: solicitud.telefono,
        pin: solicitud.adminPinHash,
        rol: "admin",
        fechaAlta: new Date(),
        comentarios: solicitud.email,
        idNegocio: negocio.idNegocio,
      },
    });

    const solicitudActualizada = await tx.solicitud_alta.update({
      where: {
        idSolicitudAlta,
      },
      data: {
        estado: "validada",
        fechaRevision: new Date(),
        idNegocioCreado: negocio.idNegocio,
        idPersonaAdminCreada: persona.idPersona,
      },
    });

    return {
      solicitud: solicitudActualizada,
      credenciales: {
        idNegocio: negocio.idNegocio,
        idPersona: persona.idPersona,
      },
    };
  });

  return NextResponse.json({ ok: true, ...resultado });
}
