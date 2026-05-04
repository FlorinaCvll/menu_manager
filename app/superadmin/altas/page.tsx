import SolicitudesAltaManager from "@/components/admin/SolicitudesAltaManager";
import {requireSuperAdmin} from "@/lib/auth";
import {prisma} from "@/lib/prisma";

export default async function SuperAdminAltasPage() {
  await requireSuperAdmin();

  const solicitudes = await prisma.solicitud_alta.findMany({
    orderBy: {
      fechaSolicitud: "desc",
    },
  });

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
                fechaSolicitud: Date;
                fechaPago: Date | null;
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
                fechaSolicitud: solicitud.fechaSolicitud.toISOString(),
                fechaPago: solicitud.fechaPago?.toISOString() || null,
                idNegocioCreado: solicitud.idNegocioCreado,
                idPersonaAdminCreada: solicitud.idPersonaAdminCreada,
            })
        )}
    />
  );
}
