import { NextResponse } from "next/server";
import {revalidateTag} from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { jsonError, requireApiSession } from "@/lib/api";
import {cacheTags} from "@/lib/cache-tags";
import { fechaDesdeInput } from "@/lib/fechas";
import { prisma } from "@/lib/prisma";

function limpiarLinea(linea: string) {
  return linea
    .replace(/^\s*(?:[-*•]\s*|\d+[.)-]\s*)/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizarLista(entrada: unknown): string[] {
  if (!Array.isArray(entrada)) {
    return [];
  }

  return Array.from(
    new Set(
      entrada
        .map((item: unknown) => limpiarLinea(String(item)))
        .filter(Boolean)
    )
  );
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

function esFechaInput(valor: string)
{
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor))
    {
        return false;
    }

    const [year, month, day] = valor.split("-").map(Number);
    const fecha = new Date(Date.UTC(year, month - 1, day, 12));

    return (
        fecha.getUTCFullYear() === year &&
        fecha.getUTCMonth() === month - 1 &&
        fecha.getUTCDate() === day
    );
}

function precioValido(valor: unknown)
{
    const precio = Number(valor);
    return Number.isFinite(precio) && precio >= 0 ? precio : null;
}

async function resolverPlatosPorNombre(
  tx: Prisma.TransactionClient,
  nombres: string[],
  tipoPlato: "primero" | "segundo" | "postre"
) {
  const ids: number[] = [];

  for (const nombre of nombres) {
    const existente = await tx.plato.findFirst({
      where: {
        nombre,
        tipoPlato,
      },
      orderBy: {
        idPlato: "asc",
      },
    });

    if (existente) {
      ids.push(existente.idPlato);
      continue;
    }

    const creado = await tx.plato.create({
      data: {
        nombre,
        tipoPlato,
        precioIndividual: 0,
        ingredientes: null,
        alergenos: null,
      },
    });

    ids.push(creado.idPlato);
  }

  return ids;
}

export async function GET() {
  const { error, sesion } = await requireApiSession();

  if (error || !sesion) {
    return error;
  }

  const menus = await prisma.menu.findMany({
    where: {
      idNegocio: sesion.idNegocio,
    },
    orderBy: {
      fecha: "desc",
    },
    include: {
      menu_plato: {
        include: {
          plato: true,
        },
      },
    },
  });

  return NextResponse.json({ ok: true, items: menus });
}

export async function POST(request: Request) {
  const { error, sesion } = await requireApiSession(["admin"]);

  if (error || !sesion) {
    return error;
  }

    const body = await leerBody(request);

    if (!body)
    {
        return jsonError("Datos del menu no validos.");
    }
  const primeros = normalizarLista(body.primeros);
  const segundos = normalizarLista(body.segundos);
  const postres = normalizarLista(body.postres);
    const fecha = String(body.fecha || "");
    const precio = precioValido(body.precio);
    const precioMedio = precioValido(body.precioMedio);
    const precioTerraza = precioValido(body.precioTerraza);

    if (!fecha)
    {
    return jsonError("La fecha del menú es obligatoria.");
  }

    if (!esFechaInput(fecha))
    {
        return jsonError("La fecha del menu no es valida.");
    }

    if (precio === null || precioMedio === null || precioTerraza === null)
    {
        return jsonError("Los precios deben ser numeros validos.");
    }

  if (primeros.length === 0 || segundos.length === 0) {
    return jsonError("Debes indicar al menos un primero y un segundo.");
  }

    const fechaMenu = fechaDesdeInput(fecha);

  const menu = await prisma.$transaction(async (tx) => {
    const idsPrimeros = await resolverPlatosPorNombre(tx, primeros, "primero");
    const idsSegundos = await resolverPlatosPorNombre(tx, segundos, "segundo");
    const idsPostres = await resolverPlatosPorNombre(tx, postres, "postre");
    const platosIds = [...idsPrimeros, ...idsSegundos, ...idsPostres];

    const guardado = await tx.menu.upsert({
      where: {
        idNegocio_fecha: {
          idNegocio: sesion.idNegocio,
          fecha: fechaMenu,
        },
      },
      update: {
          precio,
          precioMedio,
          precioTerraza,
          datosAdicionales: String(body.datosAdicionales || "").trim() || null,
      },
      create: {
        fecha: fechaMenu,
          precio,
          precioMedio,
          precioTerraza,
          datosAdicionales: String(body.datosAdicionales || "").trim() || null,
        idPersona: sesion.idPersona,
        idNegocio: sesion.idNegocio,
      },
    });

    await tx.menu_plato.deleteMany({
      where: {
        idMenu: guardado.idMenu,
      },
    });

    await tx.menu_plato.createMany({
      data: platosIds.map((idPlato) => ({
        idMenu: guardado.idMenu,
        idPlato,
      })),
      skipDuplicates: true,
    });

    return guardado;
  });

    revalidateTag(cacheTags.menus(sesion.idNegocio), "max");
    revalidateTag(cacheTags.menuDia(sesion.idNegocio, fechaMenu), "max");
    revalidateTag(cacheTags.platoTipo("primero"), "max");
    revalidateTag(cacheTags.platoTipo("segundo"), "max");
    revalidateTag(cacheTags.platoTipo("postre"), "max");
    revalidateTag(cacheTags.comandas(sesion.idNegocio), "max");

  return NextResponse.json({ ok: true, item: menu });
}
