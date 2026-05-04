import type { ReactNode } from "react";
import MarcoApp from "@/components/layout/MarcoApp";
import { requireSuperAdmin } from "@/lib/auth";

const navegacionSuperAdmin = [
  { href: "/superadmin/altas", label: "Solicitudes" },
];

export default async function SuperAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const sesion = await requireSuperAdmin();

  return (
    <MarcoApp
      navegacion={navegacionSuperAdmin}
      tituloNavegacion="MenuManager"
      session={sesion}
      eyebrow="ADMINITRADOR MENU MANAGER"
      title="Gestión de solicitudes de alta"
      description="Revisa la documentación, el estado del pago y los datos del restaurante antes de activar el acceso a la plataforma."
    >
      {children}
    </MarcoApp>
  );
}
