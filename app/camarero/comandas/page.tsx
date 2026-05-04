import ComandasManager from "@/components/camarero/ComandasManager";
import { requireCamareroOAdmin } from "@/lib/auth";
import { formatearFechaHora, inicioDelDia, obtenerFechaSolo } from "@/lib/fechas";
import { prisma } from "@/lib/prisma";

type FilaPlatoComanda = {
  idComanda: number;
  idPlato: number;
  cantidad: number;
  nombre: string;
  tipoPlato: "primero" | "segundo" | "postre" | "racion";
};

export default async function ComandasPage() {
  const sesion = await requireCamareroOAdmin();
  const fechaMenu = obtenerFechaSolo();
  const hoy = inicioDelDia();

  const [menuHoy, raciones, postres, comandasBase] = await Promise.all([
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
    prisma.comanda.findMany({
      where: {
        idNegocio: sesion.idNegocio,
        fecha: {
          gte: hoy,
        },
      },
      orderBy: {
        fecha: "desc",
      },
    }),
  ]);

  const idsComanda = comandasBase.map((comanda) => comanda.idComanda);

  let filasPlatos: FilaPlatoComanda[] = [];

  if (idsComanda.length > 0) {
    const marcadores = idsComanda.map(() => "?").join(", ");
    filasPlatos = (await prisma.$queryRawUnsafe(
      `
        SELECT
          cp.idComanda,
          cp.idPlato,
          cp.cantidad,
          p.nombre,
          p.tipoPlato
        FROM comanda_plato cp
        INNER JOIN plato p ON p.idPlato = cp.idPlato
        WHERE cp.idComanda IN (${marcadores})
        ORDER BY cp.idComanda DESC, p.tipoPlato ASC, p.nombre ASC
      `,
      ...idsComanda
    )) as FilaPlatoComanda[];
  }

  return (
    <ComandasManager
      menuDelDia={
        menuHoy?.menu_plato.map((item) => ({
          idPlato: item.plato.idPlato,
          nombre: item.plato.nombre,
          tipoPlato: item.plato.tipoPlato,
        })) || []
      }
      raciones={raciones.map((plato) => ({
        idPlato: plato.idPlato,
        nombre: plato.nombre,
        tipoPlato: plato.tipoPlato,
      }))}
      postres={postres.map((plato) => ({
        idPlato: plato.idPlato,
        nombre: plato.nombre,
        tipoPlato: plato.tipoPlato,
      }))}
      comandas={comandasBase.map((comanda) => ({
        idComanda: comanda.idComanda,
        fecha: formatearFechaHora(comanda.fecha),
        numMesa: comanda.numMesa,
        numComensales: comanda.numComensales,
        estado: comanda.estado,
        empresa: Boolean(comanda.empresa),
        platos: filasPlatos
          .filter((fila) => fila.idComanda === comanda.idComanda)
          .map((fila) => ({
            idPlato: Number(fila.idPlato),
            nombre: fila.nombre,
            tipoPlato: fila.tipoPlato,
            cantidad: Number(fila.cantidad),
          })),
      }))}
    />
  );
}
