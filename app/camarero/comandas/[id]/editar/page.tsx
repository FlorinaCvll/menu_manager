import { notFound } from "next/navigation";
import EditarComandaForm from "@/components/camarero/EditarComandaForm";
import { requireCamareroOAdmin } from "@/lib/auth";
import { obtenerFechaSolo } from "@/lib/fechas";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

type FilaPlatoComanda = {
  idPlato: number;
  cantidad: number;
  nombre: string;
  tipoPlato: "primero" | "segundo" | "postre" | "racion";
};

function mezclarPlatos(
  base: Array<{ idPlato: number; nombre: string; tipoPlato: "primero" | "segundo" | "postre" | "racion" }>,
  actuales: FilaPlatoComanda[],
  tipoPlato: "primero" | "segundo" | "postre" | "racion"
) {
  const mapa = new Map<number, { idPlato: number; nombre: string; tipoPlato: "primero" | "segundo" | "postre" | "racion" }>();

  for (const plato of base) {
    if (plato.tipoPlato === tipoPlato) {
      mapa.set(plato.idPlato, plato);
    }
  }

  for (const plato of actuales) {
    if (plato.tipoPlato === tipoPlato) {
      mapa.set(plato.idPlato, {
        idPlato: Number(plato.idPlato),
        nombre: plato.nombre,
        tipoPlato: plato.tipoPlato,
      });
    }
  }

  return Array.from(mapa.values()).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

export default async function EditarComandaPage({ params }: Params) {
  const sesion = await requireCamareroOAdmin();
  const { id } = await params;
  const idComanda = Number(id);

  if (!Number.isInteger(idComanda) || idComanda <= 0) {
    notFound();
  }

  const fechaMenu = obtenerFechaSolo();

  const [comanda, menuHoy, racionesBase, postresBase] = await Promise.all([
    prisma.comanda.findFirst({
      where: {
        idComanda,
        idNegocio: sesion.idNegocio,
      },
    }),
    prisma.menu.findFirst({
      where: {
        idNegocio: sesion.idNegocio,
        fecha: fechaMenu,
      },
      include: {
        menu_plato: {
          include: {
            plato: true,
          },
        },
      },
    }),
    prisma.plato.findMany({
      where: { tipoPlato: "racion" },
      orderBy: { nombre: "asc" },
    }),
    prisma.plato.findMany({
      where: { tipoPlato: "postre" },
      orderBy: { nombre: "asc" },
    }),
  ]);

  if (!comanda) {
    notFound();
  }

  const lineas = (await prisma.$queryRawUnsafe(
    `
      SELECT
        cp.idPlato,
        cp.cantidad,
        p.nombre,
        p.tipoPlato
      FROM comanda_plato cp
      INNER JOIN plato p ON p.idPlato = cp.idPlato
      WHERE cp.idComanda = ?
      ORDER BY p.nombre ASC
    `,
    idComanda
  )) as FilaPlatoComanda[];

  const menuBase =
    menuHoy?.menu_plato.map((item) => ({
      idPlato: item.plato.idPlato,
      nombre: item.plato.nombre,
      tipoPlato: item.plato.tipoPlato,
    })) || [];

  const menuDelDia = [
    ...mezclarPlatos(menuBase, lineas, "primero"),
    ...mezclarPlatos(menuBase, lineas, "segundo"),
  ];

  const raciones = mezclarPlatos(
    racionesBase.map((plato) => ({
      idPlato: plato.idPlato,
      nombre: plato.nombre,
      tipoPlato: plato.tipoPlato,
    })),
    lineas,
    "racion"
  );

  const postres = mezclarPlatos(
    postresBase.map((plato) => ({
      idPlato: plato.idPlato,
      nombre: plato.nombre,
      tipoPlato: plato.tipoPlato,
    })),
    lineas,
    "postre"
  );

  return (
    <EditarComandaForm
      idComanda={comanda.idComanda}
      numMesaInicial={comanda.numMesa}
      numComensalesInicial={comanda.numComensales}
      empresaInicial={Boolean(comanda.empresa)}
      menuDelDia={menuDelDia}
      raciones={raciones}
      postres={postres}
      platosActuales={lineas.map((linea) => ({
        idPlato: Number(linea.idPlato),
        nombre: linea.nombre,
        tipoPlato: linea.tipoPlato,
        cantidad: Number(linea.cantidad),
      }))}
    />
  );
}
