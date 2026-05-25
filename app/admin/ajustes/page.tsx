import NegocioForm from "@/components/admin/NegocioForm";
import { requireAdmin } from "@/lib/auth";
import {obtenerNegocioCacheado} from "@/lib/consultas-cache";

export default async function AjustesPage() {
  const sesion = await requireAdmin();
    const negocio = await obtenerNegocioCacheado(sesion.idNegocio);

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
