import {requireAdmin} from "@/lib/auth";
import {formatearFecha} from "@/lib/fechas";
import {prisma} from "@/lib/prisma";
import type {Prisma} from "@/generated/prisma/client";

export default async function HistorialPage() {
    const sesion = await requireAdmin();
    const menus: Prisma.menuGetPayload<{
        include: {
            persona: true;
            menu_plato: {
                include: {
                    plato: true;
                };
            };
        };
    }>[] = await prisma.menu.findMany({
        where: {
            idNegocio: sesion.idNegocio,
        },
        orderBy: {
            fecha: "desc",
        },
        include: {
            persona: true,
            menu_plato: {
                include: {
                    plato: true,
                },
            },
        },
    });

    return (
        <section className="glass-card p-6">
            <h2 className="section-title text-3xl font-semibold text-white">
                Historial de menús
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">
                Consulta los menús guardados por fecha y su composición.
            </p>

            <div className="mt-6 space-y-4">
                {menus.map((menu) => (
          <article
            key={menu.idMenu}
            className=" border border-white/10 bg-white/6 p-5"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {formatearFecha(menu.fecha)}
                </h3>
                <p className="text-sm text-[var(--muted)]">
                  Creado por {menu.persona.nombre}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="pill">{Number(menu.precio).toFixed(2)} €</span>
                <span className="pill">
                  Medio {Number(menu.precioMedio).toFixed(2)} €
                </span>
                <span className="pill">
                  Terraza {Number(menu.precioTerraza).toFixed(2)} €
                </span>
              </div>
            </div>

            <p className="mt-4 text-sm text-[var(--muted)]">
              {menu.datosAdicionales || "Sin observaciones adicionales."}
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {(["primero", "segundo", "postre"] as const).map((tipo) => {
                const platos = menu.menu_plato.filter(
                    (item: { plato: { tipoPlato: string } }) => item.plato.tipoPlato === tipo
                );

                return (
                  <div
                    key={tipo}
                    className=" border border-white/10 bg-white/6 p-4"
                  >
                    <p className="text-sm uppercase tracking-[0.24em] text-emerald-50/80">
                      {tipo === "primero"
                        ? "Primeros"
                        : tipo === "segundo"
                          ? "Segundos"
                          : "Postres"}
                    </p>
                    <div className="mt-3 space-y-2">
                      {platos.length > 0 ? (
                          platos.map((item: { idPlato: number; plato: { nombre: string } }) => (
                          <p key={item.idPlato} className="text-sm text-white">
                            {item.plato.nombre}
                          </p>
                        ))
                      ) : (
                        <p className="text-sm text-emerald-50/75">Sin platos</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
