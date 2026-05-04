"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  MonitorSmartphone,
  ReceiptText,
  Soup,
  UtensilsCrossed,
} from "lucide-react";
import { refrescarVista } from "@/lib/refrescar-vista";

type Plato = {
  idPlato: number;
  nombre: string;
  tipoPlato: "primero" | "segundo" | "postre" | "racion";
};

type PlatoComanda = Plato & {
  cantidad: number;
};

type Comanda = {
  idComanda: number;
  fecha: string;
  numMesa: number;
  numComensales: number;
  estado: string;
  empresa: boolean;
  platos: PlatoComanda[];
};

type Props = {
  menuDelDia: Plato[];
  raciones: Plato[];
  postres: Plato[];
  comandas: Comanda[];
};

type Cantidades = Record<number, number>;
type BloqueActivo = "todo" | "menu" | "raciones" | "postres";

function cambiarCantidad(
  actuales: Cantidades,
  idPlato: number,
  cambio: number
): Cantidades {
  const siguiente = (actuales[idPlato] || 0) + cambio;

  if (siguiente <= 0) {
    const resto = { ...actuales };
    delete resto[idPlato];
    return resto;
  }

  return {
    ...actuales,
    [idPlato]: siguiente,
  };
}

function totalSeleccionado(cantidades: Cantidades) {
  return Object.values(cantidades).reduce((total, cantidad) => total + cantidad, 0);
}

function obtenerLineas(cantidades: Cantidades) {
  return Object.entries(cantidades)
    .map(([idPlato, cantidad]) => ({
      idPlato: Number(idPlato),
      cantidad,
    }))
    .filter((linea) => linea.cantidad > 0);
}

function formatearPedido(platos: PlatoComanda[]) {
  return platos
    .map((plato) => `${plato.cantidad} x ${plato.nombre}`)
    .join(", ");
}

function TarjetaCantidad({
  item,
  cantidad,
  onCambiar,
}: {
  item: Plato;
  cantidad: number;
  onCambiar: (idPlato: number, cambio: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3  border border-white/10 bg-white/6 px-4 py-3 text-sm text-white sm:flex-row sm:items-center sm:justify-between">
      <span className="font-medium leading-6">{item.nombre}</span>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center  border border-white/15 bg-white/8 text-lg font-semibold text-white"
          onClick={() => onCambiar(item.idPlato, -1)}
          aria-label={`Quitar una unidad de ${item.nombre}`}
        >
          -
        </button>
        <span className="min-w-8 text-center text-base font-semibold">{cantidad}</span>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center  border border-white/15 bg-white/8 text-lg font-semibold text-white"
          onClick={() => onCambiar(item.idPlato, 1)}
          aria-label={`Anadir una unidad de ${item.nombre}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function GrupoSeleccion({
  titulo,
  icono: Icono,
  items,
  cantidades,
  onCambiar,
}: {
  titulo: string;
  icono: typeof Soup;
  items: Plato[];
  cantidades: Cantidades;
  onCambiar: (idPlato: number, cambio: number) => void;
}) {
  return (
    <div className=" border border-white/10 bg-white/6 p-5">
      <div className="flex items-center gap-3">
        <Icono className="h-5 w-5 text-[var(--accent)]" />
        <p className="font-semibold text-white">{titulo}</p>
      </div>

      <div className="mt-4 grid gap-3">
        {items.length > 0 ? (
          items.map((item) => (
            <TarjetaCantidad
              key={item.idPlato}
              item={item}
              cantidad={cantidades[item.idPlato] || 0}
              onCambiar={onCambiar}
            />
          ))
        ) : (
          <p className=" border border-white/10 bg-white/6 px-4 py-3 text-sm text-[var(--muted)]">
            No hay opciones cargadas en este bloque.
          </p>
        )}
      </div>
    </div>
  );
}

export default function ComandasManager({
  menuDelDia,
  raciones,
  postres,
  comandas,
}: Props) {
  const router = useRouter();
  const [numMesa, setNumMesa] = useState("1");
  const [numComensales, setNumComensales] = useState("2");
  const [empresa, setEmpresa] = useState(false);
  const [cantidadesSeleccionadas, setCantidadesSeleccionadas] = useState<Cantidades>({});
  const [error, setError] = useState("");
  const [cierres, setCierres] = useState<Record<number, Cantidades>>({});
  const [busqueda, setBusqueda] = useState("");
  const [bloqueActivo, setBloqueActivo] = useState<BloqueActivo>("todo");

  const totalActual = totalSeleccionado(cantidadesSeleccionadas);
  const busquedaNormalizada = busqueda.trim().toLowerCase();

  const primerosFiltrados = useMemo(
    () =>
      menuDelDia.filter(
        (plato) =>
          plato.tipoPlato === "primero" &&
          plato.nombre.toLowerCase().includes(busquedaNormalizada)
      ),
    [menuDelDia, busquedaNormalizada]
  );

  const segundosFiltrados = useMemo(
    () =>
      menuDelDia.filter(
        (plato) =>
          plato.tipoPlato === "segundo" &&
          plato.nombre.toLowerCase().includes(busquedaNormalizada)
      ),
    [menuDelDia, busquedaNormalizada]
  );

  const racionesFiltradas = useMemo(
    () =>
      raciones.filter((plato) =>
        plato.nombre.toLowerCase().includes(busquedaNormalizada)
      ),
    [raciones, busquedaNormalizada]
  );

  const postresFiltrados = useMemo(
    () =>
      postres.filter((plato) =>
        plato.nombre.toLowerCase().includes(busquedaNormalizada)
      ),
    [postres, busquedaNormalizada]
  );

  const comandasAbiertas = useMemo(
    () =>
      comandas.filter(
        (comanda) => comanda.estado !== "cerrada"
      ),
    [comandas]
  );

  const comandasCerradas = useMemo(
    () =>
      comandas.filter((comanda) => comanda.estado === "cerrada"),
    [comandas]
  );

  function actualizarCantidadSeleccion(idPlato: number, cambio: number) {
    setCantidadesSeleccionadas((actuales) =>
      cambiarCantidad(actuales, idPlato, cambio)
    );
  }

  function actualizarCantidadCierre(
    idComanda: number,
    idPlato: number,
    cambio: number
  ) {
    setCierres((actuales) => ({
      ...actuales,
      [idComanda]: cambiarCantidad(actuales[idComanda] || {}, idPlato, cambio),
    }));
  }

  async function handleCrearComanda(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const lineas = obtenerLineas(cantidadesSeleccionadas);

    const response = await fetch("/api/comandas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        numMesa,
        numComensales,
        empresa,
        lineas,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "No se ha podido crear la comanda.");
      return;
    }

    setNumMesa("1");
    setNumComensales("2");
    setEmpresa(false);
    setCantidadesSeleccionadas({});
    refrescarVista(router);
  }

  async function cerrarComanda(idComanda: number) {
    const lineas = obtenerLineas(cierres[idComanda] || {});

    if (lineas.length === 0) {
      setError("Selecciona al menos un postre para cerrar la comanda.");
      return;
    }

    const response = await fetch(`/api/comandas/${idComanda}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lineas }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "No se ha podido cerrar la comanda.");
      return;
    }

    setCierres((actuales) => ({ ...actuales, [idComanda]: {} }));
    refrescarVista(router);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
      <section className="glass-card  p-6">
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className=" border border-white/10 bg-white/8 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-50/75">
              Menú del dia
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {menuDelDia.length}
            </p>
          </div>
          <div className=" border border-white/10 bg-white/8 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-50/75">
              Raciones
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">{raciones.length}</p>
          </div>
          <div className=" border border-white/10 bg-white/8 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-50/75">
              Unidades
            </p>
            <p className="mt-2 text-2xl font-semibold text-white">{totalActual}</p>
          </div>
        </div>

        <form onSubmit={handleCrearComanda} className="mt-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-emerald-50/92">
              <span className="mb-2 block font-semibold text-white">Mesa</span>
              <input
                type="number"
                min="1"
                className="field"
                placeholder="Ejemplo: 4"
                value={numMesa}
                onChange={(event) => setNumMesa(event.target.value)}
                required
              />
            </label>
            <label className="block text-sm text-emerald-50/92">
              <span className="mb-2 block font-semibold text-white">Comensales</span>
              <input
                type="number"
                min="1"
                className="field"
                placeholder="Ejemplo: 2"
                value={numComensales}
                onChange={(event) => setNumComensales(event.target.value)}
                required
              />
            </label>
          </div>

          <label className="flex items-center gap-3  border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
            <input
              type="checkbox"
              checked={empresa}
              onChange={(event) => setEmpresa(event.target.checked)}
            />
            Comida de empresa
          </label>

          <div className="space-y-3  border border-white/10 bg-white/6 p-4">
            <label className="block text-sm text-emerald-50/92">
              <span className="mb-2 block font-semibold text-white">
                Buscar plato o racion
              </span>
              <input
                type="text"
                className="field"
                placeholder="Escribe croquetas, ensalada, flan..."
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
              />
            </label>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {[
                ["todo", "Ver todo"],
                ["menu", "Solo menu"],
                ["raciones", "Solo raciones"],
                ["postres", "Solo postres"],
              ].map(([valor, etiqueta]) => (
                <button
                  key={valor}
                  type="button"
                  className={` px-4 py-3 text-sm font-semibold ${
                    bloqueActivo === valor
                      ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                      : "border border-white/10 bg-white/8 text-white"
                  }`}
                  onClick={() => setBloqueActivo(valor as BloqueActivo)}
                >
                  {etiqueta}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {(bloqueActivo === "todo" || bloqueActivo === "menu") && (
              <GrupoSeleccion
                titulo="Primeros del menu"
                icono={UtensilsCrossed}
                items={primerosFiltrados}
                cantidades={cantidadesSeleccionadas}
                onCambiar={actualizarCantidadSeleccion}
              />
            )}
            {(bloqueActivo === "todo" || bloqueActivo === "menu") && (
              <GrupoSeleccion
                titulo="Segundos del menu"
                icono={UtensilsCrossed}
                items={segundosFiltrados}
                cantidades={cantidadesSeleccionadas}
                onCambiar={actualizarCantidadSeleccion}
              />
            )}
            {(bloqueActivo === "todo" || bloqueActivo === "raciones") && (
              <GrupoSeleccion
                titulo="Raciones"
                icono={Soup}
                items={racionesFiltradas}
                cantidades={cantidadesSeleccionadas}
                onCambiar={actualizarCantidadSeleccion}
              />
            )}
            {(bloqueActivo === "todo" || bloqueActivo === "postres") && (
              <GrupoSeleccion
                titulo="Postres"
                icono={ReceiptText}
                items={postresFiltrados}
                cantidades={cantidadesSeleccionadas}
                onCambiar={actualizarCantidadSeleccion}
              />
            )}
          </div>

          {error ? (
            <p className=" border border-red-300/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
          ) : null}

          <div className=" border border-white/10 bg-white/6 p-3 sm:border-0 sm:bg-transparent sm:p-0">
            <button className="primary-button w-full sm:w-auto" type="submit">
              Guardar comanda ({totalActual})
            </button>
          </div>
        </form>
      </section>

      <div className="space-y-5">
        <section className="glass-card  p-6">
          <h2 className="section-title text-2xl font-semibold text-white">
            Comandas abiertas
          </h2>
          <div className="mt-6 space-y-4">
            {comandasAbiertas.map((comanda) => (
              <article
                key={comanda.idComanda}
                className=" border border-white/10 bg-white/6 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Mesa {comanda.numMesa}
                    </h3>
                    <p className="text-sm text-emerald-50/85">
                      {comanda.numComensales} comensales
                    </p>
                  </div>
                  <span className="pill text-white">
                    {comanda.empresa ? "Empresa" : "Normal"}
                  </span>
                </div>

                <p className="mt-3 text-xs uppercase tracking-[0.22em] text-emerald-50/70">
                  {comanda.fecha}
                </p>
                <p className="mt-3 text-sm leading-6 text-emerald-50/92">
                  Pedido: {formatearPedido(comanda.platos)}
                </p>

                <div className="mt-4 space-y-3">
                  <p className="text-sm font-semibold text-white">
                    Añadir postres para cerrar
                  </p>
                  <div className="grid gap-3">
                    {postres.map((postre) => (
                      <TarjetaCantidad
                        key={postre.idPlato}
                        item={postre}
                        cantidad={(cierres[comanda.idComanda] || {})[postre.idPlato] || 0}
                        onCambiar={(idPlato, cambio) =>
                          actualizarCantidadCierre(comanda.idComanda, idPlato, cambio)
                        }
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => cerrarComanda(comanda.idComanda)}
                  >
                    Cerrar comanda
                  </button>
                  <Link
                    href={`/camarero/comandas/${comanda.idComanda}/editar`}
                    className="secondary-button"
                  >
                    Editar comanda
                  </Link>
                  <Link
                    href={`/camarero/comandas/${comanda.idComanda}`}
                    className="secondary-button"
                  >
                    Vista cocina
                  </Link>
                </div>
              </article>
            ))}

            {comandasAbiertas.length === 0 ? (
              <p className=" border border-white/10 bg-white/6 p-5 text-sm text-emerald-50/85">
                No hay comandas abiertas ahora mismo.
              </p>
            ) : null}
          </div>
        </section>

        <section className="glass-card  p-6">
          <h2 className="section-title text-2xl font-semibold text-white">
            Comandas cerradas
          </h2>
          <div className="mt-6 space-y-4">
            {comandasCerradas.map((comanda) => (
              <article
                key={comanda.idComanda}
                className=" border border-white/10 bg-white/6 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Mesa {comanda.numMesa}
                    </h3>
                    <p className="text-sm text-emerald-50/85">
                      {comanda.numComensales} comensales
                    </p>
                  </div>
                  <span className="pill text-emerald-100">Cerrada</span>
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.22em] text-emerald-50/70">
                  {comanda.fecha}
                </p>
                <p className="mt-3 text-sm leading-6 text-emerald-50/92">
                  {formatearPedido(comanda.platos)}
                </p>
                <Link
                  href={`/camarero/comandas/${comanda.idComanda}/editar`}
                  className="secondary-button mt-4"
                >
                  Editar comanda
                </Link>
                <Link
                  href={`/camarero/comandas/${comanda.idComanda}`}
                  className="secondary-button mt-4"
                >
                  Vista cocina
                </Link>
              </article>
            ))}

            {comandasCerradas.length === 0 ? (
              <p className=" border border-white/10 bg-white/6 p-5 text-sm text-emerald-50/85">
                Todavía no se ha cerrado ninguna comanda.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
