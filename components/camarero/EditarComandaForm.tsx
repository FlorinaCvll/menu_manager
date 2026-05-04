"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClipboardPen,
  MonitorSmartphone,
  ReceiptText,
  Soup,
  UtensilsCrossed,
} from "lucide-react";

type Plato = {
  idPlato: number;
  nombre: string;
  tipoPlato: "primero" | "segundo" | "postre" | "racion";
};

type PlatoActual = Plato & {
  cantidad: number;
};

type Props = {
  idComanda: number;
  numMesaInicial: number;
  numComensalesInicial: number;
  empresaInicial: boolean;
  menuDelDia: Plato[];
  raciones: Plato[];
  postres: Plato[];
  platosActuales: PlatoActual[];
};

type Cantidades = Record<number, number>;
type BloqueActivo = "todo" | "menu" | "raciones" | "postres";

function cantidadesIniciales(platosActuales: PlatoActual[]) {
  return platosActuales.reduce<Cantidades>((acc, plato) => {
    acc[plato.idPlato] = plato.cantidad;
    return acc;
  }, {});
}

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

function obtenerLineas(cantidades: Cantidades) {
  return Object.entries(cantidades)
    .map(([idPlato, cantidad]) => ({
      idPlato: Number(idPlato),
      cantidad,
    }))
    .filter((linea) => linea.cantidad > 0);
}

function totalSeleccionado(cantidades: Cantidades) {
  return Object.values(cantidades).reduce((total, cantidad) => total + cantidad, 0);
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
    <div className="flex flex-col gap-3 border border-white/10 bg-white/6 px-4 py-3 text-sm text-white sm:flex-row sm:items-center sm:justify-between">
      <span className="font-medium leading-6">{item.nombre}</span>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center  border border-white/15 bg-white/8 text-lg font-semibold text-white"
          onClick={() => onCambiar(item.idPlato, -1)}
        >
          -
        </button>
        <span className="min-w-8 text-center text-base font-semibold">{cantidad}</span>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center  border border-white/15 bg-white/8 text-lg font-semibold text-white"
          onClick={() => onCambiar(item.idPlato, 1)}
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

export default function EditarComandaForm({
  idComanda,
  numMesaInicial,
  numComensalesInicial,
  empresaInicial,
  menuDelDia,
  raciones,
  postres,
  platosActuales,
}: Props) {
  const router = useRouter();
  const [numMesa, setNumMesa] = useState(String(numMesaInicial));
  const [numComensales, setNumComensales] = useState(String(numComensalesInicial));
  const [empresa, setEmpresa] = useState(empresaInicial);
  const [cantidadesSeleccionadas, setCantidadesSeleccionadas] = useState<Cantidades>(
    cantidadesIniciales(platosActuales)
  );
  const [busqueda, setBusqueda] = useState("");
  const [bloqueActivo, setBloqueActivo] = useState<BloqueActivo>("todo");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

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

  function actualizarCantidadSeleccion(idPlato: number, cambio: number) {
    setCantidadesSeleccionadas((actuales) =>
      cambiarCantidad(actuales, idPlato, cambio)
    );
  }

  async function guardarCambios(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGuardando(true);
    setError("");

    const response = await fetch(`/api/comandas/${idComanda}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        numMesa,
        numComensales,
        empresa,
        lineas: obtenerLineas(cantidadesSeleccionadas),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "No se ha podido editar la comanda.");
      setGuardando(false);
      return;
    }

    router.push("/camarero/comandas");
    router.refresh();

    if (typeof window !== "undefined") {
      window.location.href = "/camarero/comandas";
    }
  }

  return (
    <section className="glass-card  p-6">
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className=" border border-white/10 bg-white/8 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-emerald-50/75">
            Comanda
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">#{idComanda}</p>
        </div>
        <div className=" border border-white/10 bg-white/8 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-emerald-50/75">
            Platos
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {Object.keys(cantidadesSeleccionadas).length}
          </p>
        </div>
        <div className=" border border-white/10 bg-white/8 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-emerald-50/75">
            Unidades
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">{totalActual}</p>
        </div>
      </div>

      <form onSubmit={guardarCambios} className="mt-6 space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm text-emerald-50/92">
            <span className="mb-2 block font-semibold text-white">Mesa</span>
            <input
              type="number"
              min="1"
              className="field"
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
              Buscar plato o ración
            </span>
            <input
              type="text"
              className="field"
              placeholder="Escribe croquetas, merluza, flan..."
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </label>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {[
              ["todo", "Ver todo"],
              ["menu", "Solo menú"],
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
              titulo="Primeros del menú"
              icono={UtensilsCrossed}
              items={primerosFiltrados}
              cantidades={cantidadesSeleccionadas}
              onCambiar={actualizarCantidadSeleccion}
            />
          )}
          {(bloqueActivo === "todo" || bloqueActivo === "menu") && (
            <GrupoSeleccion
              titulo="Segundos del menú"
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

        <div className="flex flex-col gap-3 sm:flex-row">
          <button className="primary-button w-full sm:w-auto" type="submit" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
          <Link href="/camarero/comandas" className="secondary-button w-full sm:w-auto">
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  );
}
