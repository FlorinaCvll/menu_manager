import Link from "next/link";
import { notFound } from "next/navigation";
import BotonImprimir from "@/components/shared/BotonImprimir";
import { requireCamareroOAdmin } from "@/lib/auth";
import { formatearFechaHora } from "@/lib/fechas";
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

  const comanda = await prisma.comanda.findFirst({
    where: {
      idComanda,
      idNegocio: sesion.idNegocio,
    },
  });

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
        <header className="text-center">
          <p className="text-[11px] uppercase tracking-[0.35em] text-slate-700">
            Cocina
          </p>
          <p className="mt-2 text-sm text-slate-700">
            {formatearFechaHora(comanda.fecha)}
          </p>
          <div className="ticket-mesa mt-4">
            <p className="ticket-mesa-label">Mesa</p>
            <p className="ticket-mesa-numero">{comanda.numMesa}</p>
          </div>
          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">
            {comanda.numComensales} comensales
          </p>
        </header>

        <div className="ticket-linea mt-4" />

        <section className="mt-4 space-y-3 text-slate-900">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-300 px-3 py-3 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600">
                Comensales
              </p>
              <p className="mt-1 text-2xl font-extrabold text-slate-950">
                {comanda.numComensales}
              </p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <p>
              <strong>Tipo:</strong> {comanda.empresa ? "Empresa" : "Normal"}
            </p>
            <p>
              <strong>Comanda:</strong> #{comanda.idComanda}
            </p>
            <p>
              <strong>Lineas:</strong> {totalLineas}
            </p>
          </div>
        </section>

        <div className="ticket-linea mt-4" />

        <div
          className={`mt-4 space-y-4 ${
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
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-800">
                  {titulo}
                </h2>
                <div className="mt-2 space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.idPlato}
                      className="flex items-start justify-between gap-3 text-base text-slate-950"
                    >
                      <span className="font-bold">{item.cantidad}x</span>
                      <span className="flex-1 leading-6">{item.nombre}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null
          )}
        </div>

        <div className="ticket-linea mt-5" />

        <footer className="mt-4 text-center text-xs uppercase tracking-[0.16em] text-slate-600">
          MenuManager
        </footer>
      </article>
    </section>
  );
}
