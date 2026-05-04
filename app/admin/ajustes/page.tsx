import NegocioForm from "@/components/admin/NegocioForm";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AjustesPage() {
  const sesion = await requireAdmin();
  const negocio = await prisma.negocio.findUniqueOrThrow({
    where: {
      idNegocio: sesion.idNegocio,
    },
  });

  return (
    <NegocioForm
      negocio={{
        nombre: negocio.nombre,
        direccion: negocio.direccion,
        telefono: negocio.telefono,
        CIF_NIF: negocio.CIF_NIF,
        estado: negocio.estado,
      }}
    />
  );
}
