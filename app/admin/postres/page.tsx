import PlatosManager from "@/components/admin/PlatosManager";
import {requireAdmin} from "@/lib/auth";
import {obtenerPlatosPorTipoCacheados} from "@/lib/consultas-cache";
import type {Prisma} from "@/generated/prisma/client";

export default async function PostresPage() {
    const sesion = await requireAdmin();

    const postres = await obtenerPlatosPorTipoCacheados(sesion.idNegocio, "postre");

  return (
    <PlatosManager
      titulo="Postres"
      descripcion="Gestiona los postres que pueden servirse solos o para cerrar una comanda."
      tipo="postre"
      platos={postres.map((plato: {
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
