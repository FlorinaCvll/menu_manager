import Link from "next/link";
import {ClipboardList, Dessert, Plus, Soup, UsersRound,} from "lucide-react";
import {requireAdmin} from "@/lib/auth";
import {inicioDelDia, obtenerFechaSolo} from "@/lib/fechas";
import {prisma} from "@/lib/prisma";

export default async function AdminPage() {
  const sesion = await requireAdmin();
  const fechaMenu = obtenerFechaSolo();
  const hoy = inicioDelDia();

  const [usuariosActivos, camareros, postres, raciones, menuHoy, comandasHoy] =
      await Promise.all([
        prisma.persona.count({
          where: { idNegocio: sesion.idNegocio, fechaBaja: null },
        }),
        prisma.persona.findMany({
          where: { idNegocio: sesion.idNegocio, rol: "camarero", fechaBaja: null },
          orderBy: [{ nombre: "asc" }, { apellidos: "asc" }],
          select: { idPersona: true, nombre: true, apellidos: true, telefono: true },
        }),
          prisma.plato.count({where: {idNegocio: sesion.idNegocio, tipoPlato: "postre"}}),
          prisma.plato.count({where: {idNegocio: sesion.idNegocio, tipoPlato: "racion"}}),
        prisma.menu.findUnique({
          where: { idNegocio_fecha: { idNegocio: sesion.idNegocio, fecha: fechaMenu } },
        }),
        prisma.comanda.count({
          where: { idNegocio: sesion.idNegocio, fecha: { gte: hoy } },
        }),
      ]);

  const camarerosTyped: {
    idPersona: number;
    nombre: string;
    apellidos: string | null;
    telefono: string | null
  }[] = camareros;

  const tarjetasResumen = [
    { label: "Usuarios activos", value: usuariosActivos, icon: UsersRound, href: "/admin/usuarios" },
    { label: "Postres registrados", value: postres, icon: Dessert, href: "/admin/postres" },
    { label: "Raciones registradas", value: raciones, icon: Soup, href: "/admin/raciones" },
    { label: "Comandas hoy", value: comandasHoy, icon: ClipboardList, href: "/camarero/comandas" },
  ];

  return (
      <div className="space-y-5 lg:space-y-6">
        <section className="grid gap-5 xl:grid-cols-[0.95fr_1.3fr_0.95fr]">
          <article className="paper-panel p-5 lg:p-6">
            <p className="paper-tag">Equipo</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-stone-900">
              Gestión de usuarios
            </h2>
            <p className="mt-3 text-sm leading-6 text-stone-700">
              Controla los accesos y gestiona los roles de tu personal con total seguridad.
            </p>

            <Link
                href="/admin/usuarios"
                className="mt-6 inline-flex w-full items-center justify-center  border border-[var(--line-strong)] bg-white px-4 py-3 text-sm font-semibold text-stone-900"
            >
              Ver equipo
            </Link>
          </article>

          <article className="glass-card-strong p-6 text-center lg:p-8">
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.2em] text-[var(--accent)]">
              Panel de control
            </p>
            <h2 className="section-title mt-4 text-4xl font-semibold text-white sm:text-5xl">
              Bienvenido, {sesion.nombre}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-100/82 sm:text-base">
              Tu centro de mando para gestionar la operativa diaria, el menú y el rendimiento de tu restaurante.
            </p>

            <div className="mx-auto mt-8 flex max-w-xl flex-col gap-3">
              <Link
                  href="/admin/menus"
                  className="primary-button min-h-[4.4rem] w-full text-base"
              >
                Gestionar menú del día
              </Link>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                    href="/admin/postres"
                    className="secondary-button min-h-[3.7rem] w-full"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo postre
                </Link>
                <Link
                    href="/admin/raciones"
                    className="secondary-button min-h-[3.7rem] w-full"
                >
                  <Plus className="h-4 w-4" />
                  Nueva ración
                </Link>
              </div>
            </div>
          </article>

          <article className="paper-panel p-5 lg:p-6">
            <p className="paper-tag">Estado</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-stone-900">
              Monitor de actividad
            </h2>
            <div className="mt-5 space-y-3 text-sm leading-6 text-stone-700">
              <div className="border border-[var(--line)] bg-white px-4 py-3">
                <strong className="block text-stone-900">
                  {menuHoy ? "Menú publicado" : "Menú pendiente"}
                </strong>
                <span>
                {menuHoy
                    ? "La oferta gastronómica ya está disponible en sala."
                    : "Es necesario configurar el menú para hoy."}
              </span>
              </div>
              <div className=" border border-[var(--line)] bg-white px-4 py-3">
                <strong className="block text-stone-900">Comandas registradas</strong>
                <span>{comandasHoy} operativas en la jornada actual.</span>
              </div>
            </div>
          </article>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="paper-panel  p-5 lg:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="paper-tag">Sala</p>
                <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-stone-900">
                  Equipo de sala
                </h2>
                <p className="mt-3 text-sm leading-6 text-stone-700">
                  Consulta tu plantilla activa para una coordinación fluida durante el servicio.
                </p>
              </div>
              <UsersRound className="mt-1 h-6 w-6 text-[var(--accent-strong)]" />
            </div>

            <div className="mt-6 space-y-3">
              {camarerosTyped.length ? (
                  camarerosTyped.map((camarero) => (
                      <div
                          key={camarero.idPersona}
                          className="flex flex-col gap-3 border border-[var(--line)] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-base font-semibold text-stone-900">
                            {camarero.nombre}
                            {camarero.apellidos ? ` ${camarero.apellidos}` : ""}
                          </p>
                          <p className="mt-1 text-sm text-stone-600">
                            Usuario #{camarero.idPersona}
                          </p>
                        </div>
                        <div className="text-sm text-stone-600 sm:text-right">
                          <p>{camarero.telefono || "Sin teléfono registrado"}</p>
                          <p className="mt-1 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-stone-500">
                            Camarero
                          </p>
                        </div>
                      </div>
                  ))
              ) : (
                  <div className=" border border-dashed border-[var(--line-strong)] bg-white/70 px-4 py-5 text-sm leading-6 text-stone-700">
                    No hay camareros activos asignados a este negocio actualmente.
                  </div>
              )}
            </div>
          </article>

          <article className="glass-card  p-5 lg:p-6">
            <p className="whimsy-label">Resumen Ejecutivo</p>
            <div className="mt-5 grid gap-3">
              {tarjetasResumen.map((tarjeta) => (
                  <Link
                      key={tarjeta.label}
                      href={tarjeta.href}
                      className="flex items-center justify-between  border border-white/10 bg-white/6 px-4 py-4 text-white"
                  >
                    <div className="flex items-center gap-3">
                      <tarjeta.icon className="h-5 w-5 text-[var(--accent)]" />
                      <span className="text-sm font-semibold">{tarjeta.label}</span>
                    </div>
                    <span className="section-title text-2xl font-semibold">
                  {tarjeta.value}
                </span>
                  </Link>
              ))}
            </div>
          </article>
        </section>
      </div>
  );
}
