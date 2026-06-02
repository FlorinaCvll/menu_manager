"use client";

import {useEffect, useState} from "react";
import {Pencil, Trash2} from "lucide-react";
import type {plato_tipoPlato} from "@/generated/prisma/client";

type Plato = {
  idPlato: number;
  nombre: string;
  precioIndividual: number;
  ingredientes: string | null;
  alergenos: string | null;
};

type Props = {
  titulo: string;
  descripcion: string;
  tipo: plato_tipoPlato;
  endpoint?: string;
  platos: Plato[];
  permitirCargaRapida?: boolean;
};

const emptyForm = {
  nombre: "",
  precioIndividual: "0",
  ingredientes: "",
  alergenos: "",
};

type PlatoApi = Omit<Plato, "precioIndividual"> & {
    precioIndividual: number | string | null;
};

function normalizarPlato(plato: PlatoApi): Plato
{
    return {
        idPlato: plato.idPlato,
        nombre: plato.nombre,
        precioIndividual: Number(plato.precioIndividual || 0),
        ingredientes: plato.ingredientes,
        alergenos: plato.alergenos,
    };
}

function ordenarPlatos(platos: Plato[])
{
    return [...platos].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

export default function PlatosManager({
  titulo,
  descripcion,
  tipo,
  endpoint = "/api/platos",
  platos,
  permitirCargaRapida = false,
}: Props) {
    const [platosVisibles, setPlatosVisibles] = useState(platos);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loteTexto, setLoteTexto] = useState("");
  const [error, setError] = useState("");

    useEffect(() =>
    {
        setPlatosVisibles(platos);
    }, [platos]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const url = editingId ? `${endpoint}/${editingId}` : endpoint;
    const method = editingId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        tipoPlato: tipo,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "No se ha podido guardar el plato.");
      return;
    }

      const platoGuardado = normalizarPlato(data.item);
      setPlatosVisibles((current) =>
      {
          const sinPlatoPrevio = current.filter(
              (plato) => plato.idPlato !== platoGuardado.idPlato,
          );

          return ordenarPlatos([...sinPlatoPrevio, platoGuardado]);
      });
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleBulkSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const lineas = loteTexto
      .split("\n")
      .map((linea) => linea.trim())
      .filter(Boolean);

    if (lineas.length === 0) {
      setError("Escribe al menos un plato para la carga rápida.");
      return;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tipoPlato: tipo,
        nombres: lineas,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "No se ha podido hacer la carga rápida.");
      return;
    }

      if (Array.isArray(data.items))
      {
          const platosCreados = data.items.map(normalizarPlato);
          setPlatosVisibles((current) => ordenarPlatos([...current, ...platosCreados]));
      } else
      {
          setPlatosVisibles((current) =>
              ordenarPlatos([
                  ...current,
                  ...lineas.map((nombre, index) => ({
                      idPlato: -Date.now() - index,
                      nombre,
                      precioIndividual: 0,
                      ingredientes: null,
                      alergenos: null,
                  })),
              ]),
          );
      }
    setLoteTexto("");
  }

  function handleEdit(plato: Plato) {
    setEditingId(plato.idPlato);
    setForm({
      nombre: plato.nombre,
      precioIndividual: String(plato.precioIndividual),
      ingredientes: plato.ingredientes || "",
      alergenos: plato.alergenos || "",
    });
  }

  async function handleDelete(idPlato: number) {
    const confirmar = window.confirm("¿Quieres eliminar este plato?");

    if (!confirmar) {
      return;
    }

      setError("");

      const response = await fetch(`${endpoint}/${idPlato}`, {
      method: "DELETE",
    });

      const data = await response.json();

      if (!response.ok)
      {
          setError(data.error || "No se ha podido eliminar el plato.");
          return;
      }

      setPlatosVisibles((current) =>
          current.filter((plato) => plato.idPlato !== idPlato),
      );
  }

  const placeholderCargaRapida =
    titulo === "Primeros"
      ? "Ensalada mixta\nLentejas caseras\nGazpacho"
      : "Pollo asado\nMerluza al horno\nFilete de ternera";

  return (
    <div className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
      <section className="glass-card p-6">
        <h2 className="section-title text-2xl font-semibold text-white">
          {editingId ? `Editar ${titulo.toLowerCase()}` : `Añadir ${titulo.toLowerCase()}`}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">{descripcion}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            className="field"
            placeholder="Nombre"
            value={form.nombre}
            onChange={(event) =>
              setForm((current) => ({ ...current, nombre: event.target.value }))
            }
            required
          />
          <input
            className="field"
            type="number"
            min="0"
            step="0.01"
            placeholder="Precio"
            value={form.precioIndividual}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                precioIndividual: event.target.value,
              }))
            }
            required
          />
          <textarea
            className="field min-h-24"
            placeholder="Ingredientes"
            value={form.ingredientes}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                ingredientes: event.target.value,
              }))
            }
          />
          <textarea
            className="field min-h-24"
            placeholder="Alérgenos"
            value={form.alergenos}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                alergenos: event.target.value,
              }))
            }
          />

          {error ? (
            <p className=" border border-red-300/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button className="primary-button" type="submit">
              {editingId ? "Actualizar" : "Guardar"}
            </button>
            {editingId ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                  setError("");
                }}
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </form>

        {permitirCargaRapida && !editingId ? (
          <form
            onSubmit={handleBulkSubmit}
            className="mt-6 border-t border-white/10 pt-6"
          >
            <h3 className="text-lg font-semibold text-white">Carga rápida</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Un plato por línea. Así puedes añadir todos los {titulo.toLowerCase()} de golpe.
            </p>
            <textarea
              className="field mt-4 min-h-40"
              placeholder={placeholderCargaRapida}
              value={loteTexto}
              onChange={(event) => setLoteTexto(event.target.value)}
            />
            <button type="submit" className="secondary-button mt-4">
              Guardar varios
            </button>
          </form>
        ) : null}
      </section>

      <section className="glass-card  p-6">
        <h2 className="section-title text-2xl font-semibold text-white">
          Catálogo disponible
        </h2>
        <div className="mt-6 space-y-4">
            {platosVisibles.map((plato) => (
            <article
              key={plato.idPlato}
              className=" border border-white/10 bg-white/6 p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">
                      {plato.nombre}
                    </h3>
                    <span className="pill text-emerald-100">
                      {plato.precioIndividual.toFixed(2)} €
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Ingredientes: {plato.ingredientes || "No indicados"}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Alérgenos: {plato.alergenos || "No indicados"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="secondary-button px-4 py-3 text-sm"
                    onClick={() => handleEdit(plato)}
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    type="button"
                    className="secondary-button px-4 py-3 text-sm text-red-100"
                    onClick={() => handleDelete(plato.idPlato)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
