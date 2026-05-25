import Link from "next/link";
import { notFound } from "next/navigation";
import BotonImprimir from "@/components/shared/BotonImprimir";
import { requireCamareroOAdmin } from "@/lib/auth";
import { formatearFechaHora } from "@/lib/fechas";
import {obtenerComandaCacheada} from "@/lib/consultas-cache";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

type FilaPlatoComanda = {
  idPlato: number;
  cantidad: number;
  nombre: string;
  tipoPlato: "primero" | "segundo" | "postre" | "racion";
};

export default async function ComandaCocinaPage({ params }: Params) {
  const sesion = await requireCamareroOAdmin();
  const { id } = await params;
  const idComanda = Number(id);

  if (!Number.isInteger(idComanda) || idComanda <= 0) {
    notFound();
  }

    const comanda = await obtenerComandaCacheada(sesion.idNegocio, idComanda);

  if (!comanda) {
    notFound();
  }

  const lineas = (await prisma.$queryRawUnsafe(
    `
      SELECT
        cp.idPlato,
        cp.cantidad,
        p.nombre,
        p.tipoPlato
      FROM comanda_plato cp
      INNER JOIN plato p ON p.idPlato = cp.idPlato
      WHERE cp.idComanda = ?
      ORDER BY
        FIELD(p.tipoPlato, 'primero', 'segundo', 'racion', 'postre'),
        p.nombre ASC
    `,
    idComanda
  )) as FilaPlatoComanda[];

  const grupos = {
    primeros: lineas.filter((linea) => linea.tipoPlato === "primero"),
    segundos: lineas.filter((linea) => linea.tipoPlato === "segundo"),
    raciones: lineas.filter((linea) => linea.tipoPlato === "racion"),
    postres: lineas.filter((linea) => linea.tipoPlato === "postre"),
  };

  const totalLineas = lineas.length;
  const totalUnidades = lineas.reduce(
    (total, linea) => total + Number(linea.cantidad),
    0
  );
  const hayNombreLargo = lineas.some((linea) => linea.nombre.length > 28);
  const esComandaGrande =
    totalLineas >= 7 || totalUnidades >= 10 || Boolean(hayNombreLargo);

  return (
    <section className="space-y-5">
      <div className="glass-card no-print p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="section-title text-3xl font-semibold text-white">
              Comanda de cocina
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/camarero/comandas" className="secondary-button">
              Volver a comandas
            </Link>
            <Link
              href={`/camarero/comandas/${comanda.idComanda}/editar`}
              className="secondary-button"
            >
              Editar comanda
            </Link>
            <BotonImprimir etiqueta="Imprimir cocina" />
          </div>
        </div>
      </div>

      <article
        className={`ticket-cocina mx-auto w-full rounded-[1.5rem] p-5 ${
          esComandaGrande
            ? "ticket-cocina-grande max-w-4xl"
            : "ticket-cocina-pequena max-w-[92mm]"
        }`}
      >
          <header>
              <div className="flex items-start justify-between gap-4">
                  <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">
                          Comanda
                      </p>
                      <h1 className="mt-2 text-3xl font-black tracking-normal text-slate-950">
                          Cocina
                      </h1>
                  </div>
                  <div className="text-right">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                          #{comanda.idComanda}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-700">
                          {formatearFechaHora(comanda.fecha)}
                      </p>
                  </div>
              </div>

              <div className="ticket-meta-grid mt-5">
                  <div className="ticket-meta-card">
                      <p className="ticket-meta-label">Mesa</p>
                      <p className="ticket-meta-value">{comanda.numMesa}</p>
                  </div>
                  <div className="ticket-meta-card">
                      <p className="ticket-meta-label">Comensales</p>
                      <p className="ticket-meta-value">{comanda.numComensales}</p>
                  </div>
                  <div className="ticket-meta-card">
                      <p className="ticket-meta-label">Tipo</p>
                      <p className="ticket-meta-value text-xl">
                          {comanda.empresa ? "Empresa" : "Normal"}
                      </p>
                  </div>
              </div>
          </header>

          <div className="ticket-linea mt-5"/>

        <div
            className={`mt-5 space-y-4 ${
            esComandaGrande ? "ticket-grupos-grande md:grid md:grid-cols-2 md:gap-5 md:space-y-0" : ""
          }`}
        >
          {([
            ["Primeros", grupos.primeros],
            ["Segundos", grupos.segundos],
            ["Raciones", grupos.raciones],
            ["Postres", grupos.postres],
          ] as const).map(([titulo, items]) =>
            items.length > 0 ? (
              <section key={titulo} className="break-inside-avoid">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  {titulo}
                </h2>
                  <div className="mt-3 space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.idPlato}
                      className="ticket-item flex items-start gap-3 text-base text-slate-950"
                    >
                        <span className="ticket-item-quantity">{item.cantidad}x</span>
                        <span className="flex-1 leading-6 font-semibold">{item.nombre}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null
          )}
        </div>

        <div className="ticket-linea mt-5" />

          <footer
              className="mt-4 flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              <span>{totalLineas} lineas</span>
              <span>{totalUnidades} unidades</span>
              <span>MenuManager</span>
        </footer>
      </article>
    </section>
  );
}
