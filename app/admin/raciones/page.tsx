import PlatosManager from "@/components/admin/PlatosManager";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function RacionesPage() {
  await requireAdmin();

  const raciones = await prisma.plato.findMany({
    where: {
      tipoPlato: "racion",
    },
    orderBy: {
      nombre: "asc",
    },
  });

  return (
    <PlatosManager
      titulo="Raciones"
      descripcion="Catálogo de platos que se mantienen siempre disponibles fuera del menú del día."
      tipo="racion"
      platos={raciones.map((plato) => ({
        idPlato: plato.idPlato,
        nombre: plato.nombre,
        precioIndividual: Number(plato.precioIndividual || 0),
        ingredientes: plato.ingredientes,
        alergenos: plato.alergenos,
      }))}
    />
  );
}
