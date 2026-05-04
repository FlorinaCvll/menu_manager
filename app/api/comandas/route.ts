import { NextResponse } from "next/server";
import { jsonError, requireApiSession } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type LineaEntrada = {
  idPlato: number;
  cantidad: number;
};

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

export async function GET() {
  const { error, sesion } = await requireApiSession();

  if (error || !sesion) {
    return error;
  }

  const comandas = await prisma.comanda.findMany({
    where: {
      idNegocio: sesion.idNegocio,
    },
    orderBy: {
      fecha: "desc",
    },
    include: {
      comanda_plato: {
        include: {
          plato: true,
        },
      },
    },
  });

  return NextResponse.json({ ok: true, items: comandas });
}

export async function POST(request: Request) {
  const { error, sesion } = await requireApiSession(["admin", "camarero"]);

  if (error || !sesion) {
    return error;
  }

  const body = await request.json();
  const lineas = normalizarLineas(body.lineas);

  if (!body.numMesa || !body.numComensales || lineas.length === 0) {
    return jsonError("Mesa, comensales y platos son obligatorios.");
  }

  const platosValidos = await prisma.plato.count({
    where: {
      idPlato: {
        in: lineas.map((linea) => linea.idPlato),
      },
    },
  });

  if (platosValidos !== lineas.length) {
    return jsonError("Hay platos no validos en la comanda.");
  }

  const comanda = await prisma.$transaction(async (tx) => {
    const creada = await tx.comanda.create({
      data: {
        fecha: new Date(),
        numMesa: Number(body.numMesa),
        numComensales: Number(body.numComensales),
        empresa: Boolean(body.empresa),
        idPersona: sesion.idPersona,
        idNegocio: sesion.idNegocio,
      },
    });

    for (const linea of lineas) {
      await tx.$executeRawUnsafe(
        "INSERT INTO comanda_plato (idComanda, idPlato, cantidad) VALUES (?, ?, ?)",
        creada.idComanda,
        linea.idPlato,
        linea.cantidad
      );
    }

    return creada;
  });

  return NextResponse.json({ ok: true, item: comanda });
}
