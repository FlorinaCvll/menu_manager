import { NextResponse } from "next/server";
import {revalidateTag} from "next/cache";
import { jsonError, requireApiSession } from "@/lib/api";
import {cacheTags} from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";

function esObjeto(valor: unknown): valor is Record<string, unknown>
{
    return Boolean(valor && typeof valor === "object" && !Array.isArray(valor));
}

async function leerBody(request: Request)
{
    const body = await request.json().catch(() => null);
    return esObjeto(body) ? body : null;
}

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

    if (!Number.isInteger(idSolicitudAlta) || idSolicitudAlta <= 0)
    {
        return jsonError("Solicitud no valida.", 400);
    }

    const body = await leerBody(request);

    if (!body)
    {
        return jsonError("Datos de solicitud no validos.");
    }

  const accion = String(body.accion || "");

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

      revalidateTag(cacheTags.solicitudesAlta, "max");
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

    revalidateTag(cacheTags.solicitudesAlta, "max");
  return NextResponse.json({ ok: true, ...resultado });
}
