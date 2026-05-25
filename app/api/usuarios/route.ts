import bcrypt from "bcryptjs";
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

function limpiarTexto(valor: unknown)
{
    return String(valor || "").trim();
}

function pinValido(pin: string)
{
    return pin.length >= 4 && pin.length <= 20;
}

export async function GET() {
  const { error, sesion } = await requireApiSession(["admin"]);

  if (error || !sesion) {
    return error;
  }

  const usuarios = await prisma.persona.findMany({
    where: {
      idNegocio: sesion.idNegocio,
    },
    orderBy: {
      nombre: "asc",
    },
  });

  return NextResponse.json({ ok: true, items: usuarios });
}

export async function POST(request: Request) {
  const { error, sesion } = await requireApiSession(["admin"]);

  if (error || !sesion) {
    return error;
  }

    const body = await leerBody(request);

    if (!body)
    {
        return jsonError("Datos de usuario no validos.");
    }

    const nombre = limpiarTexto(body.nombre);
    const pin = limpiarTexto(body.pin);

    if (!nombre || !pin)
    {
    return jsonError("Nombre y PIN son obligatorios.");
  }

    if (!pinValido(pin))
    {
        return jsonError("El PIN debe tener entre 4 y 20 caracteres.");
    }

  const usuario = await prisma.persona.create({
    data: {
        nombre,
        apellidos: limpiarTexto(body.apellidos) || null,
        telefono: limpiarTexto(body.telefono) || null,
        pin: await bcrypt.hash(pin, 10),
      rol: body.rol === "admin" ? "admin" : "camarero",
      fechaAlta: new Date(),
      fechaBaja: body.activo === false ? new Date() : null,
        comentarios: limpiarTexto(body.comentarios) || null,
      idNegocio: sesion.idNegocio,
    },
  });

    revalidateTag(cacheTags.usuarios(sesion.idNegocio), "max");
  return NextResponse.json({ ok: true, item: usuario });
}
