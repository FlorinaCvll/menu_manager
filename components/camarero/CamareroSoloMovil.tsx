"use client";

import React, {useEffect, useState} from "react";
import {MonitorSmartphone} from "lucide-react";
import BotonCerrarSesion from "@/components/layout/BotonCerrarSesion";
import type {UsuarioSesion} from "@/types/session";

type PropiedadesCamareroSoloMovil = {
  session: UsuarioSesion;
  children: React.ReactNode;
};

export default function CamareroSoloMovil({
  children,
                                          }: PropiedadesCamareroSoloMovil)
{
  const [anchoPantalla, setAnchoPantalla] = useState<number | null>(null);

  useEffect(() => {
    function actualizarAncho() {
      setAnchoPantalla(window.innerWidth);
    }

    actualizarAncho();
    window.addEventListener("resize", actualizarAncho);

    return () => {
      window.removeEventListener("resize", actualizarAncho);
    };
  }, []);

  const comprobando = anchoPantalla === null;
  const esTabletOEscritorio = anchoPantalla !== null && anchoPantalla >= 768;
  const bloquearPorDispositivo = esTabletOEscritorio;

  if (comprobando) {
    return (
      <div className="marco-app flex min-h-screen items-center justify-center px-4">
        <div className="glass-card w-full max-w-md p-8 text-center">
          <p className="text-base font-semibold text-white">
            Comprobando dispositivo...
          </p>
        </div>
      </div>
    );
  }

  if (bloquearPorDispositivo) {
    return (
      <main className="marco-app flex min-h-screen items-center justify-center px-4 py-10">
        <section className="glass-card-strong w-full max-w-xl border border-white/12 p-8 text-left">
          <div className="flex items-center gap-3 text-[var(--accent)]">
            <MonitorSmartphone className="h-6 w-6" />
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-100/72">
              Acceso restringido
            </p>
          </div>

          <h1 className="section-title mt-5 text-3xl font-semibold text-white">
            La vista de sala solo esta disponible desde móvil o PDA
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-7 text-slate-100/82">
            Esta parte de la aplicacion esta reservada al trabajo en sala. Si
            necesitas entrar aqui, abre la aplicacion desde un movil o una PDA.
          </p>

            <div className="mt-6">
                <BotonCerrarSesion/>
            </div>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
