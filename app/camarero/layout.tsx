import type { ReactNode } from "react";
import CamareroSoloMovil from "@/components/camarero/CamareroSoloMovil";
import MarcoApp from "@/components/layout/MarcoApp";
import { requireCamareroOAdmin } from "@/lib/auth";
import { navegacionCamarero } from "@/lib/constantes";

export default async function CamareroLayout({
  children,
}: {
  children: ReactNode;
}) {
  const sesion = await requireCamareroOAdmin();

  return (
    <CamareroSoloMovil session={sesion}>
      <MarcoApp
        navegacion={navegacionCamarero}
        session={sesion}
        compactMobile
      >
        {children}
      </MarcoApp>
    </CamareroSoloMovil>
  );
}
