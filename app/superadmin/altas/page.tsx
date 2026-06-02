import SolicitudesAltaManager from "@/components/admin/SolicitudesAltaManager";
import {requireSuperAdmin} from "@/lib/auth";
import {obtenerSolicitudesAltaCacheadas} from "@/lib/consultas-cache";

function serializarFecha(fecha: Date | string | null | undefined)
{
    if (!fecha)
    {
        return null;
    }

    return fecha instanceof Date ? fecha.toISOString() : fecha;
}

export default async function SuperAdminAltasPage() {
  await requireSuperAdmin();

    const solicitudes = await obtenerSolicitudesAltaCacheadas();

  return (
    <SolicitudesAltaManager
        solicitudes={solicitudes.map(
            (solicitud: {
                idSolicitudAlta: number;
                nombreRestaurante: string;
                CIF_NIF: string;
                personaContacto: string;
                email: string;
                telefono: string;
                direccion: string;
                numeroLocales: string;
                comentarios: string | null;
                documentoPropiedadUrl: string;
                estado: string;
                fechaSolicitud: Date | string;
                fechaPago: Date | string | null;
                idNegocioCreado: number | null;
                idPersonaAdminCreada: number | null;
            }) => ({
                idSolicitudAlta: solicitud.idSolicitudAlta,
                nombreRestaurante: solicitud.nombreRestaurante,
                CIF_NIF: solicitud.CIF_NIF,
                personaContacto: solicitud.personaContacto,
                email: solicitud.email,
                telefono: solicitud.telefono,
                direccion: solicitud.direccion,
                numeroLocales: solicitud.numeroLocales,
                comentarios: solicitud.comentarios,
                documentoPropiedadUrl: solicitud.documentoPropiedadUrl,
                estado: solicitud.estado,
                fechaSolicitud: serializarFecha(solicitud.fechaSolicitud) || "",
                fechaPago: serializarFecha(solicitud.fechaPago),
                idNegocioCreado: solicitud.idNegocioCreado,
                idPersonaAdminCreada: solicitud.idPersonaAdminCreada,
            })
        )}
    />
  );
}
