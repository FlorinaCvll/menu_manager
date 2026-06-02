import Link from "next/link";
import type {ReactNode} from "react";
import type {UsuarioSesion} from "@/types/session";
import BotonCerrarSesion from "@/components/layout/BotonCerrarSesion";
import Marca from "@/components/shared/Marca";

type ElementoNavegacion = {
  href: string;
  label: string;
};

type MarcoAppProps = {
  navegacion: ElementoNavegacion[];
  navegacionSecundaria?: ElementoNavegacion[];
  tituloNavegacion?: string;
  tituloNavegacionSecundaria?: string;
  session: UsuarioSesion;
  eyebrow?: string;
  title?: string;
  description?: string;
  children: ReactNode;
  compactMobile?: boolean;
};

function ListaNavegacion({
  elementos,
  alineacion = "left",
}: {
  elementos: ElementoNavegacion[];
  alineacion?: "left" | "center";
}) {
  const claseBoton =
    "border border-white/10 bg-white/7 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/12";

  return (
    <nav className="flex flex-wrap gap-2 lg:flex-col">
      {elementos.map((elemento) => (
        <Link
          key={elemento.href}
          href={elemento.href}
          className={`${claseBoton} ${alineacion === "center" ? "text-center lg:text-center" : ""}`}
        >
          {elemento.label}
        </Link>
      ))}
    </nav>
  );
}

function PanelLateral({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside
        className={`glass-card-strong no-print w-full p-5 lg:sticky lg:top-4 lg:min-h-[calc(100vh-2rem)] lg:w-[268px] ${className}`}
    >
      {children}
    </aside>
  );
}

export default function MarcoApp({
  navegacion,
  navegacionSecundaria,
  tituloNavegacion = "Navegación",
  tituloNavegacionSecundaria = "Más opciones",
  session,
  eyebrow,
  title,
  description,
  children,
  compactMobile = false,
}: MarcoAppProps) {
  const tieneNavegacionSecundaria = Boolean(navegacionSecundaria?.length);

  if (compactMobile) {
    return (
      <div className="marco-app">
        <div className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col gap-4 px-3 py-3 sm:px-4 lg:py-6">
            <section className="glass-card-strong no-print p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <Marca href="/" compacta />
              <BotonCerrarSesion />
            </div>

            <div className="mt-4 border border-white/10 bg-white/8 p-4">
              <p className="text-sm text-slate-100/85">Turno activo</p>
              <h2 className="section-title mt-2 text-2xl font-semibold text-white">
                {session.nombre}
              </h2>
              <p className="mt-1 text-sm uppercase tracking-[0.24em] text-[var(--accent)]">
                {session.rol}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-100/80">
                Negocio #{session.idNegocio} - Usuario #{session.idPersona}
              </p>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-sm uppercase tracking-[0.22em] text-slate-100/82">
                Navegación
              </p>
              <ListaNavegacion elementos={navegacion} />
            </div>
          </section>
          

          <main className="space-y-4 lg:space-y-5">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="marco-app">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] flex-col gap-4 px-3 py-3 lg:px-6 lg:py-4">
        <div
          className={`flex flex-col gap-4 ${
            tieneNavegacionSecundaria
              ? "xl:grid xl:grid-cols-[268px_minmax(0,1fr)_268px] xl:items-start xl:gap-6"
              : "lg:flex-row lg:items-start lg:gap-6"
          }`}
        >
          <PanelLateral
            className={
              compactMobile
                ? "p-4 lg:w-[308px]"
                : tieneNavegacionSecundaria
                  ? "xl:w-[268px]"
                  : "lg:w-[308px]"
            }
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <Marca href="/" compacta={compactMobile} />
                {!tieneNavegacionSecundaria || compactMobile ? (
                  <div className="lg:hidden">
                    <BotonCerrarSesion />
                  </div>
                ) : null}
              </div>

              <div className="border border-white/10 bg-white/8 p-4">
                <p className="text-sm text-slate-100/85">Turno activo</p>
                <h2 className="section-title mt-2 text-2xl font-semibold text-white">
                  {session.nombre}
                </h2>
                <p className="mt-1 text-sm uppercase tracking-[0.24em] text-[var(--accent)]">
                  {session.rol}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-100/80">
                  Negocio #{session.idNegocio} - Usuario #{session.idPersona}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm uppercase tracking-[0.22em] text-slate-100/82">
                  {tituloNavegacion}
                </p>
                <ListaNavegacion elementos={navegacion} />
              </div>

              {tieneNavegacionSecundaria && !compactMobile ? (
                <div className="hidden lg:block">
                  <BotonCerrarSesion />
                </div>
              ) : null}

              {!tieneNavegacionSecundaria && !compactMobile ? (
                <>
                  <div>
                    <BotonCerrarSesion />
                  </div>
                </>
              ) : null}

              {compactMobile ? (
                <div className="lg:hidden">
                  <BotonCerrarSesion />
                </div>
              ) : null}
            </div>
          </PanelLateral>

          <div className="min-w-0 flex-1 space-y-4 lg:space-y-5">
            <header
                className={`glass-card no-print p-5 sm:p-6 lg:p-8 ${
                compactMobile ? "hidden lg:block" : ""
              }`}
            >
              <p className="text-sm uppercase tracking-[0.32em] text-slate-100/90">
                {eyebrow}
              </p>
              <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <h1 className="section-title text-balance text-3xl font-semibold text-white sm:text-4xl">
                    {title}
                  </h1>
                  <p className="mt-3 text-balance text-sm leading-7 text-slate-100/86 sm:text-base">
                    {description}
                  </p>
                </div>
                <div className="paper-panel max-w-xs p-4">
                  <p className="paper-tag">Hoy importa</p>
                  <p className="mt-3 text-sm leading-6 text-stone-700">
                    Objetivo de hoy: ser mejor que ayer.
                  </p>
                </div>
              </div>
            </header>

            <main className="space-y-4 lg:space-y-5">{children}</main>
          </div>

          {tieneNavegacionSecundaria ? (
            <PanelLateral className="xl:w-[268px]">
              <div className="space-y-5">
                <div className="paper-panel p-4">
                  <p className="paper-tag">Solo hoy...</p>
                  <p className="mt-3 text-sm leading-6 text-stone-700">
                    El camino correcto no siempre es el fácil.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-100/82">
                    {tituloNavegacionSecundaria}
                  </p>
                  <ListaNavegacion
                    elementos={navegacionSecundaria ?? []}
                    alineacion="center"
                  />
                </div>

                <div className="mt-auto">
                  <BotonCerrarSesion />
                </div>
              </div>
            </PanelLateral>
          ) : null}
        </div>
      </div>
    </div>
  );
}
