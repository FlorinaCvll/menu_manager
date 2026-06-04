import {NextResponse} from "next/server";
import {revalidateTag} from "next/cache";
import type {plato_tipoPlato} from "@/generated/prisma/client";
import {jsonError, requireApiSession} from "@/lib/api";
import {cacheTags} from "@/lib/cache-tags";
import {prisma} from "@/lib/prisma";

const tiposValidos: plato_tipoPlato[] = [
  "primero",
  "segundo",
  "postre",
  "racion",
];

function validarTipo(tipo: string | undefined | null): tipo is plato_tipoPlato {
  return Boolean(tipo && tiposValidos.includes(tipo as plato_tipoPlato));
}

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

function precioValido(valor: unknown)
{
    const precio = Number(valor || 0);
    return Number.isFinite(precio) && precio >= 0 ? precio : null;
}

function revalidarVistasDePlatos(idNegocio: number, tipo: plato_tipoPlato)
{
    revalidateTag(cacheTags.platoTipo(idNegocio, tipo), "max");
}

export async function listarPlatos(tipo?: string | null) {
    const {error, sesion} = await requireApiSession(["admin", "camarero"]);

    if (error || !sesion)
    {
        return error;
    }

  const platos = await prisma.plato.findMany({
      where: {
          idNegocio: sesion.idNegocio,
          ...(validarTipo(tipo) ? {tipoPlato: tipo} : {}),
      },
    orderBy: {
      nombre: "asc",
    },
  });

  return NextResponse.json({ ok: true, items: platos });
}

export async function crearPlato(request: Request, tipoFijo?: plato_tipoPlato) {
    const {error, sesion} = await requireApiSession(["admin"]);

    if (error || !sesion)
    {
    return error;
  }

    const body = await leerBody(request);

    if (!body)
    {
        return jsonError("Datos del plato no validos.");
    }

    const tipo = tipoFijo || (typeof body.tipoPlato === "string" ? body.tipoPlato : undefined);
    const nombre = limpiarTexto(body.nombre);
    const precioIndividual = precioValido(body.precioIndividual);

  if (!validarTipo(tipo)) {
    return jsonError("Tipo de plato no válido.");
  }

    if (precioIndividual === null)
    {
        return jsonError("El precio no es valido.");
    }

    if (!nombre)
    {
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
            idNegocio: sesion.idNegocio,
        })),
      });

        revalidarVistasDePlatos(sesion.idNegocio, tipo);
      return NextResponse.json({ ok: true });
    }

    return jsonError("El nombre es obligatorio.");
  }

  const plato = await prisma.plato.create({
    data: {
        nombre,
        precioIndividual,
        ingredientes: limpiarTexto(body.ingredientes) || null,
        alergenos: limpiarTexto(body.alergenos) || null,
      tipoPlato: tipo,
        idNegocio: sesion.idNegocio,
    },
  });

    revalidarVistasDePlatos(sesion.idNegocio, tipo);
  return NextResponse.json({ ok: true, item: plato });
}

export async function actualizarPlato(
  request: Request,
  idPlato: number,
  tipoFijo?: plato_tipoPlato
) {
    const {error, sesion} = await requireApiSession(["admin"]);

    if (error || !sesion)
    {
    return error;
  }

    if (!Number.isInteger(idPlato) || idPlato <= 0)
    {
        return jsonError("Plato no vÃ¡lido.", 400);
    }

    const body = await leerBody(request);

    if (!body)
    {
        return jsonError("Datos del plato no validos.");
    }

    const tipo = tipoFijo || (typeof body.tipoPlato === "string" ? body.tipoPlato : undefined);
    const nombre = limpiarTexto(body.nombre);
    const precioIndividual = precioValido(body.precioIndividual);

  if (!validarTipo(tipo)) {
    return jsonError("Tipo de plato no válido.");
  }

    if (!nombre)
    {
        return jsonError("El nombre es obligatorio.");
    }

    if (precioIndividual === null)
    {
        return jsonError("El precio no es valido.");
    }

    const existe = await prisma.plato.findFirst({
        where: {
            idPlato,
            idNegocio: sesion.idNegocio,
        },
    });

    if (!existe)
    {
        return jsonError("Plato no encontrado.", 404);
    }

  const plato = await prisma.plato.update({
    where: { idPlato },
    data: {
        nombre,
        precioIndividual,
        ingredientes: limpiarTexto(body.ingredientes) || null,
        alergenos: limpiarTexto(body.alergenos) || null,
      tipoPlato: tipo,
        idNegocio: sesion.idNegocio,
    },
  });

    revalidarVistasDePlatos(sesion.idNegocio, tipo);
  return NextResponse.json({ ok: true, item: plato });
}

export async function eliminarPlato(idPlato: number) {
    const {error, sesion} = await requireApiSession(["admin"]);

    if (error || !sesion)
    {
    return error;
  }

    if (!Number.isInteger(idPlato) || idPlato <= 0)
    {
        return jsonError("Plato no válido.", 400);
    }

    const existe = await prisma.plato.findFirst({
        where: {
            idPlato,
            idNegocio: sesion.idNegocio,
        },
  });

    if (!existe)
    {
        return jsonError("Plato no encontrado.", 404);
    }

    const plato = await prisma.plato.delete({
        where: {idPlato},
    });

    revalidarVistasDePlatos(sesion.idNegocio, plato.tipoPlato);
  return NextResponse.json({ ok: true });
}
