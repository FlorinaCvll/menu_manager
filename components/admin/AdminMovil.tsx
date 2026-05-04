"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";

export default function AdminMovil({
  children,
}: {
  children: React.ReactNode;
}) {
  const [anchoPantalla, setAnchoPantalla] = useState<number | null>(null);

  useEffect(() => {
    const actualizarAncho = () => {
      setAnchoPantalla(window.innerWidth);
    };

    actualizarAncho();
    window.addEventListener("resize", actualizarAncho);

    return () => {
      window.removeEventListener("resize", actualizarAncho);
    };
  }, []);

  const comprobando = anchoPantalla === null;
  const esMovilOPda = anchoPantalla !== null && anchoPantalla < 1024;

  if (comprobando) {
    return (
      <div className="marco-app flex min-h-screen items-center justify-center px-4">
        <div className="glass-card w-full max-w-md p-8 text-center">
          <p className="text-lg font-semibold text-white">Preparando panel…</p>
        </div>
      </div>
    );
  }

  if (esMovilOPda) {
    return (
      <main className="marco-app flex min-h-screen items-center justify-center px-4 py-10">
        <section className="glass-card mx-auto flex w-full max-w-lg flex-col items-center gap-5  p-8 text-center">
          <span className="glass-card flex h-16 w-16 items-center justify-center">
            <Monitor className="h-8 w-8 text-[var(--accent)]" />
          </span>
          <div className="space-y-2">
            <p className="pill mx-auto">
              <Smartphone className="h-4 w-4" />
              Administración solo en ordenador
            </p>
            <h1 className="section-title text-3xl font-semibold text-white">
              Esta zona está pensada para escritorio
            </h1>
            <p className="text-balance text-sm text-[var(--muted)] sm:text-base">
              El administrador puede gestionar usuarios, menús e historial desde
              un ordenador. En PDA o móvil se usa la vista de sala.
            </p>
          </div>
          <Link href="/camarero" className="primary-button">
            Ir a la vista móvil
          </Link>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
