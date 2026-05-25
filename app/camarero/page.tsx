import Link from "next/link";
import {requireCamareroOAdmin} from "@/lib/auth";
import {inicioDelDia, obtenerFechaSolo} from "@/lib/fechas";
import {prisma} from "@/lib/prisma";

export default async function CamareroPage() {
    const sesion = await requireCamareroOAdmin();
    const fechaMenu = obtenerFechaSolo();
    const hoy = inicioDelDia();

    const [menuHoy, comandasHoy] = await Promise.all([
        prisma.menu.findFirst({
            where: {
                idNegocio: sesion.idNegocio,
                fecha: fechaMenu,
            },
            include: {
                menu_plato: true,
            },
        }),
        prisma.comanda.count({
            where: {
                idNegocio: sesion.idNegocio,
                fecha: {
                    gte: hoy,
                },
            },
        }),
    ]);

    return (
        <>
            <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
                <article className="glass-card p-6">
                    <p className="whimsy-label">Servicio actual</p>
                    <h2 className="section-title mt-5 text-3xl font-semibold text-white">
                        Hola, {sesion.nombre}
                    </h2>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <Link href="/camarero/menuDia" className="secondary-button">
                            Ver menú del día
                        </Link>
                        <Link href="/camarero/comandas" className="primary-button">
                            Abrir comandas digitales
                        </Link>
                    </div>
                </article>

                <article className="glass-card p-6">
                    <p className="whimsy-label">Estado del menú</p>
                    <h2 className="section-title mt-5 text-2xl font-semibold text-white">
                        {menuHoy ? "Menú cargado para hoy" : "A la espera del menú diario"}
                    </h2>
                    <p className="mt-3 text-sm text-emerald-50/90">
                        {menuHoy
                            ? "El menú del día ya está disponible para los clientes."
                        : "Cuando el administrador guarde el menú, aparecerá aquí automáticamente."}
                    </p>
                    <p className="mt-3 text-sm text-emerald-50/90">
                        Comandas abiertas hoy: {comandasHoy}
                    </p>
                </article>
            </section>
        </>
    );
}
