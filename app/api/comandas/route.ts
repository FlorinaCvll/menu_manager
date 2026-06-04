import {NextResponse} from "next/server";
import {revalidateTag} from "next/cache";
import {jsonError, requireApiSession} from "@/lib/api";
import {cacheTags} from "@/lib/cache-tags";
import {prisma} from "@/lib/prisma";

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

    const body = await leerBody(request);

    if (!body)
    {
        return jsonError("Datos de comanda no validos.");
    }

    const numMesa = enteroPositivo(body.numMesa);
    const numComensales = enteroPositivo(body.numComensales);
  const lineas = normalizarLineas(body.lineas);

    if (!numMesa || !numComensales || lineas.length === 0)
    {
    return jsonError("Mesa, comensales y platos son obligatorios.");
  }

  const platosValidos = await prisma.plato.count({
    where: {
        idNegocio: sesion.idNegocio,
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
          numMesa,
          numComensales,
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

    revalidateTag(cacheTags.comandas(sesion.idNegocio), "max");
  return NextResponse.json({ ok: true, item: comanda });
}
