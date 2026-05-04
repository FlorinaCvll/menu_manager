import Link from "next/link";
import { ClipboardList } from "lucide-react";
import BotonImprimir from "@/components/shared/BotonImprimir";
import { requireCamareroOAdmin } from "@/lib/auth";
import { formatearFecha, obtenerFechaSolo } from "@/lib/fechas";
import { prisma } from "@/lib/prisma";

export default async function MenuDiaPage() {
  const sesion = await requireCamareroOAdmin();
  const fechaMenu = obtenerFechaSolo();

  const menu = await prisma.menu.findFirst({
    where: {
      idNegocio: sesion.idNegocio,
      fecha: fechaMenu,
    },
    include: {
      menu_plato: {
        include: {
          plato: true,
        },
      },
    },
  });

  const grupos = {
    primeros:
      menu?.menu_plato.filter((item) => item.plato.tipoPlato === "primero") || [],
    segundos:
      menu?.menu_plato.filter((item) => item.plato.tipoPlato === "segundo") || [],
    postres:
      menu?.menu_plato.filter((item) => item.plato.tipoPlato === "postre") || [],
  };

  const totalPlatos =
    grupos.primeros.length + grupos.segundos.length + grupos.postres.length;
  const observaciones = menu?.datosAdicionales?.trim() || "";
  const hayNombreLargo = menu?.menu_plato.some((item) => item.plato.nombre.length > 28);
  const modoCompacto =
    totalPlatos >= 11 || observaciones.length > 120 || Boolean(hayNombreLargo);

  return (
    <section className="space-y-5">
      <div className="glass-card no-print p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/camarero/comandas" className="primary-button">
              <ClipboardList className="h-5 w-5" />
              Comandas digitales
            </Link>
            {menu ? <BotonImprimir /> : null}
          </div>
        </div>
      </div>

      {menu ? (
        <article
          className={`menu-paper mx-auto w-full max-w-[190mm] p-5 sm:p-8 ${
            modoCompacto ? "menu-paper-compact" : ""
          }`}
        >
          <header className="text-center">
            <p className="text-[11px] uppercase tracking-[0.42em] text-emerald-800/70">
              MenuManager
            </p>
            <h1 className="section-title mt-3 text-4xl font-semibold text-[#173630] sm:text-5xl">
              Menu del dia
            </h1>
            <p className="mt-2 text-[12px] uppercase tracking-[0.28em] text-emerald-900/60">
              {formatearFecha(menu.fecha)}
            </p>
            <div className="menu-paper-line mt-5" />
          </header>

          <section className="menu-price-grid print-section mt-6 grid gap-3 text-center sm:grid-cols-3">
            <div className=" border border-emerald-900/10 bg-emerald-50/75 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-900/55">
                Menu
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#173630]">
                {Number(menu.precio).toFixed(2)} EUR
              </p>
            </div>
            <div className=" border border-emerald-900/10 bg-emerald-50/75 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-900/55">
                Medio menu
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#173630]">
                {Number(menu.precioMedio).toFixed(2)} EUR
              </p>
            </div>
            <div className=" border border-emerald-900/10 bg-emerald-50/75 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-900/55">
                Terraza
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#173630]">
                {Number(menu.precioTerraza).toFixed(2)} EUR
              </p>
            </div>
          </section>

          <section className="menu-grid mt-7 grid gap-6 lg:grid-cols-3">
            {([
              ["Primeros", grupos.primeros],
              ["Segundos", grupos.segundos],
              ["Postres", grupos.postres],
            ] as const).map(([titulo, items]) => (
              <article key={titulo} className="print-section">
                <h3 className="section-title text-center text-2xl font-semibold text-[#173630]">
                  {titulo}
                </h3>
                <div className="menu-paper-line mt-3" />
                <div className="mt-4 space-y-3">
                  {items.length > 0 ? (
                    items.map((item) => (
                      <p
                        key={item.idPlato}
                        className="border-b border-dashed border-emerald-900/15 pb-2 text-center text-[15px] leading-6 text-[#1f3d36]"
                      >
                        {item.plato.nombre}
                      </p>
                    ))
                  ) : (
                    <p className="text-center text-sm text-emerald-900/55">
                      Sin platos cargados
                    </p>
                  )}
                </div>
              </article>
            ))}
          </section>

          <footer className="print-section mt-7">
            <div className="menu-paper-line" />
            <div className="mt-4  border border-emerald-900/10 bg-emerald-50/65 px-4 py-4 text-center">
              <p className="text-[11px] uppercase tracking-[0.24em] text-emerald-900/55">
                Observaciones
              </p>
              <p className="mt-2 text-[15px] leading-6 text-[#1f3d36]">
                {observaciones || "Sin observaciones adicionales."}
              </p>
            </div>
          </footer>
        </article>
      ) : (
        <div className="glass-card p-5">
        <p className="text-sm text-emerald-50/90">No hay menú cargado para hoy.</p>
          <Link href="/camarero/comandas" className="secondary-button mt-4">
            <ClipboardList className="h-5 w-5" />
            Ir a comandas digitales
          </Link>
        </div>
      )}

      {menu ? (
        <div className="glass-card no-print p-5 lg:hidden">
          <p className="text-sm font-semibold text-white">Servicio en PDA</p>
          <p className="mt-2 text-sm text-emerald-50/90">
            Si ya has revisado el menu, desde aqui puedes abrir o cerrar comandas
            de forma digital durante el servicio.
          </p>
          <Link href="/camarero/comandas" className="primary-button mt-4">
            <ClipboardList className="h-5 w-5" />
            Abrir comandas
          </Link>
        </div>
      ) : null}
    </section>
  );
}
