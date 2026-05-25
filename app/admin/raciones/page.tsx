import PlatosManager from "@/components/admin/PlatosManager";
import {requireAdmin} from "@/lib/auth";
import {obtenerPlatosPorTipoCacheados} from "@/lib/consultas-cache";
import type {Prisma} from "@/generated/prisma/client";

export default async function RacionesPage() {
  await requireAdmin();

    const raciones = await obtenerPlatosPorTipoCacheados("racion");

  return (
    <PlatosManager
      titulo="Raciones"
      descripcion="Catálogo de platos que se mantienen siempre disponibles fuera del menú del día."
      tipo="racion"
      platos={raciones.map((plato: {
          idPlato: number;
          nombre: string;
          precioIndividual: Prisma.Decimal | number | null;
          ingredientes: string | null;
          alergenos: string | null
      }) => ({
        idPlato: plato.idPlato,
        nombre: plato.nombre,
        precioIndividual: Number(plato.precioIndividual || 0),
        ingredientes: plato.ingredientes,
        alergenos: plato.alergenos,
      }))}
    />
  );
}
