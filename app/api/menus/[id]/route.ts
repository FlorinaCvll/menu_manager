import { NextResponse } from "next/server";
import {revalidateTag} from "next/cache";
import {jsonError, requireApiSession} from "@/lib/api";
import {cacheTags} from "@/lib/cache-tags";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  const { error, sesion } = await requireApiSession();

  if (error || !sesion) {
    return error;
  }

  const { id } = await params;
  const menuId = Number(id);

    if (!Number.isInteger(menuId) || menuId <= 0)
    {
        return jsonError("Menú no válido.", 400);
    }

  const menu = await prisma.menu.findFirst({
    where: {
      idMenu: menuId,
      idNegocio: sesion.idNegocio,
    },
    include: {
      menu_plato: {
        include: {
          plato: true,
        },
      },
    },
  });

  return NextResponse.json({ ok: true, item: menu });
}

export async function DELETE(_: Request, { params }: Params) {
  const { error, sesion } = await requireApiSession(["admin"]);

  if (error || !sesion) {
    return error;
  }

  const { id } = await params;
  const menuId = Number(id);

    if (!Number.isInteger(menuId) || menuId <= 0)
    {
        return jsonError("Menú no válido.", 400);
    }

  const menu = await prisma.menu.findFirst({
    where: {
      idMenu: menuId,
      idNegocio: sesion.idNegocio,
    },
  });

  if (!menu) {
    return NextResponse.json(
      { ok: false, error: "Menú no encontrado." },
      { status: 404 }
    );
  }

  await prisma.menu.delete({
    where: {
      idMenu: menuId,
    },
  });

    revalidateTag(cacheTags.menus(sesion.idNegocio), "max");
    revalidateTag(cacheTags.menuDia(sesion.idNegocio, menu.fecha), "max");
    revalidateTag(cacheTags.comandas(sesion.idNegocio), "max");
  return NextResponse.json({ ok: true });
}
