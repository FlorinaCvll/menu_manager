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

type Propiedades = {
  titulo: string;
  descripcion: string;
  tipo: plato_tipoPlato;
    rutaApi?: string;
  platos: Plato[];
  permitirCargaRapida?: boolean;
};

const formularioVacio = {
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
                                          rutaApi = "/api/platos",
  platos,
  permitirCargaRapida = false,
                                      }: Propiedades)
{
    const [platosVisibles, setPlatosVisibles] = useState(platos);
    const [idEnEdicion, setIdEnEdicion] = useState<number | null>(null);
    const [formulario, setFormulario] = useState(formularioVacio);
  const [loteTexto, setLoteTexto] = useState("");
  const [error, setError] = useState("");

    useEffect(() =>
    {
        setPlatosVisibles(platos);
    }, [platos]);

    async function manejarEnvio(event: React.FormEvent<HTMLFormElement>)
    {
    event.preventDefault();
    setError("");

        const urlDestino = idEnEdicion ? `${rutaApi}/${idEnEdicion}` : rutaApi;
        const metodo = idEnEdicion ? "PUT" : "POST";

        const respuesta = await fetch(urlDestino, {
            method: metodo,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
          ...formulario,
        tipoPlato: tipo,
      }),
    });

        const datos = await respuesta.json();

        if (!respuesta.ok)
        {
            setError(datos.error || "No se ha podido guardar el plato.");
      return;
    }

        const platoGuardado = normalizarPlato(datos.item);
        setPlatosVisibles((actual) =>
      {
          const sinPlatoPrevio = actual.filter(
              (plato) => plato.idPlato !== platoGuardado.idPlato,
          );

          return ordenarPlatos([...sinPlatoPrevio, platoGuardado]);
      });
        setIdEnEdicion(null);
        setFormulario(formularioVacio);
  }

    async function manejarCargaRapida(event: React.FormEvent<HTMLFormElement>)
    {
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

        const respuesta = await fetch(rutaApi, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tipoPlato: tipo,
        nombres: lineas,
      }),
    });

        const datos = await respuesta.json();

        if (!respuesta.ok)
        {
            setError(datos.error || "No se ha podido hacer la carga rápida.");
      return;
    }

        if (Array.isArray(datos.items))
      {
          const platosCreados = datos.items.map(normalizarPlato);
          setPlatosVisibles((actual) => ordenarPlatos([...actual, ...platosCreados]));
      } else
      {
          setPlatosVisibles((actual) =>
              ordenarPlatos([
                  ...actual,
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

    function manejarEdicion(plato: Plato)
    {
        setIdEnEdicion(plato.idPlato);
        setFormulario({
      nombre: plato.nombre,
      precioIndividual: String(plato.precioIndividual),
      ingredientes: plato.ingredientes || "",
      alergenos: plato.alergenos || "",
    });
  }

    async function manejarEliminacion(idPlato: number)
    {
    const confirmar = window.confirm("¿Quieres eliminar este plato?");

    if (!confirmar) {
      return;
    }

      setError("");

        const respuesta = await fetch(`${rutaApi}/${idPlato}`, {
      method: "DELETE",
    });

        const datos = await respuesta.json();

        if (!respuesta.ok)
      {
          setError(datos.error || "No se ha podido eliminar el plato.");
          return;
      }

        setPlatosVisibles((actual) =>
            actual.filter((plato) => plato.idPlato !== idPlato),
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
            {idEnEdicion ? `Editar ${titulo.toLowerCase()}` : `Añadir ${titulo.toLowerCase()}`}
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">{descripcion}</p>

          <form onSubmit={manejarEnvio} className="mt-6 space-y-4">
          <input
            className="field"
            placeholder="Nombre"
            value={formulario.nombre}
            onChange={(event) =>
                setFormulario((actual) => ({...actual, nombre: event.target.value}))
            }
            required
          />
          <input
            className="field"
            type="number"
            min="0"
            step="0.01"
            placeholder="Precio"
            value={formulario.precioIndividual}
            onChange={(event) =>
                setFormulario((actual) => ({
                    ...actual,
                precioIndividual: event.target.value,
              }))
            }
            required
          />
          <textarea
            className="field min-h-24"
            placeholder="Ingredientes"
            value={formulario.ingredientes}
            onChange={(event) =>
                setFormulario((actual) => ({
                    ...actual,
                ingredientes: event.target.value,
              }))
            }
          />
          <textarea
            className="field min-h-24"
            placeholder="Alérgenos"
            value={formulario.alergenos}
            onChange={(event) =>
                setFormulario((actual) => ({
                    ...actual,
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
                {idEnEdicion ? "Actualizar" : "Guardar"}
            </button>
              {idEnEdicion ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                    setIdEnEdicion(null);
                    setFormulario(formularioVacio);
                  setError("");
                }}
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </form>

          {permitirCargaRapida && !idEnEdicion ? (
          <form
              onSubmit={manejarCargaRapida}
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
                    onClick={() => manejarEdicion(plato)}
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    type="button"
                    className="secondary-button px-4 py-3 text-sm text-red-100"
                    onClick={() => manejarEliminacion(plato.idPlato)}
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
