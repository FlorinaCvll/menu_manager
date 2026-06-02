"use client";

import {useState} from "react";
import Link from "next/link";
import {ArrowRight, BadgeCheck, ConciergeBell, LifeBuoy, Monitor, ShoppingCart,} from "lucide-react";
import FormularioCompraEmpresa from "@/components/public/FormularioCompraEmpresa";
import Marca from "@/components/shared/Marca";

const bloques = [
  {
    icon: BadgeCheck,
    titulo: "Alta verificada",
    texto: "Validamos la información fiscal y operativa del restaurante antes de activar el entorno de trabajo.",
  },
  {
    icon: ConciergeBell,
    titulo: "Gestión operativa",
    texto: "Centraliza menús, raciones, postres y comandas en una plataforma pensada para el servicio diario.",
  },
  {
    icon: Monitor,
    titulo: "Panel administrativo",
    texto: "Administra usuarios, actualiza la oferta gastronómica y consulta el histórico desde un entorno ordenado.",
  },
  {
    icon: LifeBuoy,
    titulo: "Soporte inicial",
    texto: "Acompañamos la puesta en marcha para que el equipo pueda empezar a trabajar con claridad y seguridad.",
  },
];

export default function Home() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  function abrirFormulario()
  {
    setMostrarFormulario(true);
    requestAnimationFrame(() =>
    {
      document.getElementById("compra")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <main className="pb-14">
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <div className="glass-card-strong p-5 sm:p-7">
          <div className="flex flex-col gap-7 xl:grid xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
            <div className="space-y-6">
              <Marca />

              <div className="space-y-4">
                <p className="pill text-white">Software para restaurantes</p>
                <h1 className="section-title max-w-4xl text-4xl font-semibold text-white sm:text-5xl lg:text-[4.4rem]">
                  Gestión profesional para restaurantes, sala y administración en un único sistema.
                </h1>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={abrirFormulario} className="primary-button">
                  Solicitar alta
                  <ShoppingCart className="h-4 w-4" />
                </button>
                  <Link href="/login" className="secondary-button">
                  Acceder
                  <ArrowRight className="h-4 w-4" />
                  </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-2">
              <div className="paper-panel rounded-[1.2rem] p-4">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-stone-500">
                  Admin
                </p>
                <p className="mt-3 text-lg font-semibold text-stone-900">
                  Usuarios, platos, menús e histórico.
                </p>
              </div>
              <div className="paper-panel rounded-[1.2rem] p-4">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-stone-500">
                  Sala
                </p>
                <p className="mt-3 text-lg font-semibold text-stone-900">
                  PDA o móvil para consultar y tomar comandas.
                </p>
              </div>
              <div className="paper-panel rounded-[1.2rem] p-4 sm:col-span-3 xl:col-span-2">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-stone-500">
                  Compra
                </p>
                <p className="mt-3 text-lg font-semibold text-stone-900">
                  Pago único de activación, sin renovaciones de licencia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {bloques.map((bloque) => (
            <article key={bloque.titulo} className="paper-panel rounded-[1.2rem] p-5">
              <bloque.icon className="h-6 w-6 text-[var(--accent-strong)]" />
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-stone-900">
                {bloque.titulo}
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone-700">{bloque.texto}</p>
            </article>
          ))}
        </div>
      </section>


      <FormularioCompraEmpresa
          mostrarFormulario={mostrarFormulario}
      />
    </main>
  );
}
