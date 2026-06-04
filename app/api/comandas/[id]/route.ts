import {NextResponse} from "next/server";
import {revalidateTag} from "next/cache";
import {jsonError, requireApiSession} from "@/lib/api";
import {cacheTags} from "@/lib/cache-tags";
import {prisma} from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

type LineaEntrada = {
  idPlato: number;
  cantidad: number;
};

function esObjeto(valor: unknown): valor is Record<string, unknown>
{
    return Boolean(valor && typeof valor === "object" && !Array.isArray(valor));
}

async function leerBody(request: Request)
{
    const body = await request.json().catch(() => null);
    return esObjeto(body) ? body : null;
}

function enteroPositivo(valor: unknown)
{
    const numero = Number(valor);
    return Number.isInteger(numero) && numero > 0 ? numero : null;
}

function normalizarLineas(entrada: unknown): LineaEntrada[] {
  if (!Array.isArray(entrada)) {
    return [];
  }

  const cantidades = new Map<number, number>();

  for (const item of entrada) {
    const idPlato = Number((item as { idPlato?: unknown })?.idPlato);
    const cantidad = Number((item as { cantidad?: unknown })?.cantidad);

    if (!Number.isInteger(idPlato) || idPlato <= 0) {
      continue;
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      continue;
    }

    cantidades.set(idPlato, (cantidades.get(idPlato) || 0) + cantidad);
  }

  return Array.from(cantidades.entries()).map(([idPlato, cantidad]) => ({
    idPlato,
    cantidad,
  }));
}

async function obtenerComanda(idComanda: number, idNegocio: number) {
  return prisma.comanda.findFirst({
    where: {
      idComanda,
      idNegocio,
    },
  });
}

async function validarPlatos(lineas: LineaEntrada[], idNegocio: number)
{
  const total = await prisma.plato.count({
    where: {
        idNegocio,
      idPlato: {
        in: lineas.map((linea) => linea.idPlato),
      },
    },
  });

  return total === lineas.length;
}

async function cargarComandaActualizada(idComanda: number, idNegocio: number) {
  return prisma.comanda.findFirst({
    where: {
      idComanda,
      idNegocio,
    },
    include: {
      comanda_plato: {
        include: {
          plato: true,
        },
      },
    },
  });
}

export async function PUT(request: Request, { params }: Params) {
  const { error, sesion } = await requireApiSession(["admin", "camarero"]);

  if (error || !sesion) {
    return error;
  }

  const { id } = await params;
  const idComanda = Number(id);

    if (!Number.isInteger(idComanda) || idComanda <= 0)
    {
        return jsonError("Comanda no valida.", 400);
    }

    const body = await leerBody(request);

    if (!body)
    {
        return jsonError("Datos de comanda no validos.");
    }

    const numMesa = enteroPositivo(body.numMesa);
    const numComensales = enteroPositivo(body.numComensales);
  const lineas = normalizarLineas(body.lineas);

  const comanda = await obtenerComanda(idComanda, sesion.idNegocio);

  if (!comanda) {
    return jsonError("Comanda no encontrada.", 404);
  }

    if (!numMesa || !numComensales || lineas.length === 0)
    {
    return jsonError("Mesa, comensales y platos son obligatorios.");
  }

    const platosValidos = await validarPlatos(lineas, sesion.idNegocio);

  if (!platosValidos) {
    return jsonError("Hay platos no validos en la comanda.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.comanda.update({
      where: {
        idComanda,
      },
      data: {
          numMesa,
          numComensales,
        empresa: Boolean(body.empresa),
        estado: body.estado === "cerrada" ? "cerrada" : "abierta",
      },
    });

    await tx.$executeRawUnsafe(
      "DELETE FROM comanda_plato WHERE idComanda = ?",
      idComanda
    );

    for (const linea of lineas) {
      await tx.$executeRawUnsafe(
        "INSERT INTO comanda_plato (idComanda, idPlato, cantidad) VALUES (?, ?, ?)",
        idComanda,
        linea.idPlato,
        linea.cantidad
      );
    }
  });

  const comandaActualizada = await cargarComandaActualizada(
    idComanda,
    sesion.idNegocio
  );

    revalidateTag(cacheTags.comandas(sesion.idNegocio), "max");
  return NextResponse.json({ ok: true, item: comandaActualizada });
}

export async function PATCH(request: Request, { params }: Params) {
  const { error, sesion } = await requireApiSession(["admin", "camarero"]);

  if (error || !sesion) {
    return error;
  }

  const { id } = await params;
  const idComanda = Number(id);

    if (!Number.isInteger(idComanda) || idComanda <= 0)
    {
        return jsonError("Comanda no valida.", 400);
    }

    const body = await leerBody(request);

    if (!body)
    {
        return jsonError("Datos de comanda no validos.");
    }

  const lineas = normalizarLineas(body.lineas);

  const comanda = await obtenerComanda(idComanda, sesion.idNegocio);

  if (!comanda) {
    return jsonError("Comanda no encontrada.", 404);
  }

  if (lineas.length === 0) {
    return jsonError("Debes seleccionar al menos un postre.");
  }

  const postres = await prisma.plato.findMany({
    where: {
      idPlato: {
        in: lineas.map((linea) => linea.idPlato),
      },
        idNegocio: sesion.idNegocio,
      tipoPlato: "postre",
    },
  });

  if (postres.length !== lineas.length) {
    return jsonError("Solo se pueden anadir postres al cerrar la comanda.");
  }

  await prisma.$transaction(async (tx) => {
    for (const linea of lineas) {
      await tx.$executeRawUnsafe(
        `
          INSERT INTO comanda_plato (idComanda, idPlato, cantidad)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE cantidad = cantidad + VALUES(cantidad)
        `,
        idComanda,
        linea.idPlato,
        linea.cantidad
      );
    }

    await tx.comanda.update({
      where: {
        idComanda,
      },
      data: {
        estado: "cerrada",
      },
    });
  });

  const comandaActualizada = await cargarComandaActualizada(
    idComanda,
    sesion.idNegocio
  );

    revalidateTag(cacheTags.comandas(sesion.idNegocio), "max");
  return NextResponse.json({ ok: true, item: comandaActualizada });
}
