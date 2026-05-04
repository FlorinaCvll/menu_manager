import PlatosManager from "@/components/admin/PlatosManager";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PostresPage() {
  await requireAdmin();

  const postres = await prisma.plato.findMany({
    where: {
      tipoPlato: "postre",
    },
    orderBy: {
      nombre: "asc",
    },
  });

  return (
    <PlatosManager
      titulo="Postres"
      descripcion="Gestiona los postres que pueden servirse solos o para cerrar una comanda."
      tipo="postre"
      platos={postres.map((plato) => ({
        idPlato: plato.idPlato,
        nombre: plato.nombre,
        precioIndividual: Number(plato.precioIndividual || 0),
        ingredientes: plato.ingredientes,
        alergenos: plato.alergenos,
      }))}
    />
  );
}
