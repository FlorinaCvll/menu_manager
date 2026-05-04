import { NextResponse } from "next/server";
import type { plato_tipoPlato } from "@/generated/prisma/client";
import { jsonError, requireApiSession } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const tiposValidos: plato_tipoPlato[] = [
  "primero",
  "segundo",
  "postre",
  "racion",
];

function validarTipo(tipo: string | undefined | null): tipo is plato_tipoPlato {
  return Boolean(tipo && tiposValidos.includes(tipo as plato_tipoPlato));
}

export async function listarPlatos(tipo?: string | null) {
  const platos = await prisma.plato.findMany({
    where: validarTipo(tipo) ? { tipoPlato: tipo } : undefined,
    orderBy: {
      nombre: "asc",
    },
  });

  return NextResponse.json({ ok: true, items: platos });
}

export async function crearPlato(request: Request, tipoFijo?: plato_tipoPlato) {
  const { error } = await requireApiSession(["admin"]);

  if (error) {
    return error;
  }

  const body = await request.json();
  const tipo = tipoFijo || body.tipoPlato;

  if (!validarTipo(tipo)) {
    return jsonError("Tipo de plato no válido.");
  }

  if (!body.nombre) {
    if (Array.isArray(body.nombres) && body.nombres.length > 0) {
      const nombres = body.nombres
        .map((nombre: unknown) => String(nombre).trim())
        .filter(Boolean);

      if (nombres.length === 0) {
        return jsonError("Debes indicar al menos un plato.");
      }

      await prisma.plato.createMany({
        data: nombres.map((nombre: string) => ({
          nombre,
          precioIndividual: 0,
          ingredientes: null,
          alergenos: null,
          tipoPlato: tipo,
        })),
      });

      return NextResponse.json({ ok: true });
    }

    return jsonError("El nombre es obligatorio.");
  }

  const plato = await prisma.plato.create({
    data: {
      nombre: body.nombre,
      precioIndividual: Number(body.precioIndividual || 0),
      ingredientes: body.ingredientes || null,
      alergenos: body.alergenos || null,
      tipoPlato: tipo,
    },
  });

  return NextResponse.json({ ok: true, item: plato });
}

export async function actualizarPlato(
  request: Request,
  idPlato: number,
  tipoFijo?: plato_tipoPlato
) {
  const { error } = await requireApiSession(["admin"]);

  if (error) {
    return error;
  }

  const body = await request.json();
  const tipo = tipoFijo || body.tipoPlato;

  if (!validarTipo(tipo)) {
    return jsonError("Tipo de plato no válido.");
  }

  const plato = await prisma.plato.update({
    where: { idPlato },
    data: {
      nombre: body.nombre,
      precioIndividual: Number(body.precioIndividual || 0),
      ingredientes: body.ingredientes || null,
      alergenos: body.alergenos || null,
      tipoPlato: tipo,
    },
  });

  return NextResponse.json({ ok: true, item: plato });
}

export async function eliminarPlato(idPlato: number) {
  const { error } = await requireApiSession(["admin"]);

  if (error) {
    return error;
  }

  await prisma.plato.delete({
    where: { idPlato },
  });

  return NextResponse.json({ ok: true });
}
