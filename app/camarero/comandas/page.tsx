import ComandasManager from "@/components/camarero/ComandasManager";
import {requireCamareroOAdmin} from "@/lib/auth";
import {formatearFechaHora, inicioDelDia, obtenerFechaSolo} from "@/lib/fechas";
import {
    obtenerComandasDiaCacheadas,
    obtenerMenuDiaCacheado,
    obtenerPlatosPorTipoCacheados,
} from "@/lib/consultas-cache";
import {prisma} from "@/lib/prisma";

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
      obtenerMenuDiaCacheado(sesion.idNegocio, fechaMenu),
      obtenerPlatosPorTipoCacheados("racion"),
      obtenerPlatosPorTipoCacheados("postre"),
      obtenerComandasDiaCacheadas(sesion.idNegocio, hoy),
  ]);

  const idsComanda = comandasBase.map((comanda: { idComanda: number }) => comanda.idComanda);

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
          menuHoy?.menu_plato.map((item: { plato: { idPlato: number; nombre: string; tipoPlato: string } }) => ({
          idPlato: item.plato.idPlato,
          nombre: item.plato.nombre,
            tipoPlato: item.plato.tipoPlato as "primero" | "segundo" | "postre" | "racion",
        })) || []
      }
      raciones={raciones.map((plato: { idPlato: number; nombre: string; tipoPlato: string }) => ({
        idPlato: plato.idPlato,
        nombre: plato.nombre,
        tipoPlato: plato.tipoPlato as "primero" | "segundo" | "postre" | "racion",
      }))}
      postres={postres.map((plato: { idPlato: number; nombre: string; tipoPlato: string }) => ({
        idPlato: plato.idPlato,
        nombre: plato.nombre,
        tipoPlato: plato.tipoPlato as "primero" | "segundo" | "postre" | "racion",
      }))}
      comandas={comandasBase.map((comanda: {
        idComanda: number;
        fecha: Date;
        numMesa: number;
        numComensales: number;
        estado: string;
        empresa: boolean | null
      }) => ({
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
