import type { ReactNode } from "react";
import AdminMovil from "@/components/admin/AdminMovil";
import MarcoApp from "@/components/layout/MarcoApp";
import { requireAdmin } from "@/lib/auth";
import {
  navegacionAdminRestaurante,
  navegacionAdminUsuarios,
} from "@/lib/constantes";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const sesion = await requireAdmin();

    return (
    <AdminMovil>
      <MarcoApp
        navegacion={navegacionAdminUsuarios}
        navegacionSecundaria={navegacionAdminRestaurante}
        tituloNavegacion="Equipo"
        tituloNavegacionSecundaria="Restaurante"
        session={sesion}
        eyebrow="Administración del restaurante"
        title="Gestión operativa del negocio"
        description="Administra equipo, platos, menús y ajustes desde un panel centralizado orientado al trabajo diario del restaurante."
      >
        {children}
      </MarcoApp>
    </AdminMovil>
  );
}
