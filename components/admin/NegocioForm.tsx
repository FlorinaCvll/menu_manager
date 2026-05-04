"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { refrescarVista } from "@/lib/refrescar-vista";
import { limpiarTelefono } from "@/lib/telefono";

type Negocio = {
  nombre: string;
  direccion: string;
  telefono: string | null;
  CIF_NIF: string;
  estado: string | null;
};

export default function NegocioForm({ negocio }: { negocio: Negocio }) {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: negocio.nombre,
    direccion: negocio.direccion,
    telefono: negocio.telefono || "",
    CIF_NIF: negocio.CIF_NIF,
    estado: negocio.estado || "activo",
  });
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const response = await fetch("/api/negocio", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "No se ha podido guardar el negocio.");
      return;
    }

    refrescarVista(router);
  }

  return (
    <section className="glass-card p-6">
      <h2 className="section-title text-2xl font-semibold text-white">
        Datos del negocio
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Aquí puedes revisar el restaurante dado de alta en MenuManager.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 lg:grid-cols-2">
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
          placeholder="CIF / NIF"
          value={form.CIF_NIF}
          onChange={(event) =>
            setForm((current) => ({ ...current, CIF_NIF: event.target.value }))
          }
          required
        />
        <input
          className="field lg:col-span-2"
          placeholder="Dirección"
          value={form.direccion}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              direccion: event.target.value,
            }))
          }
          required
        />
        <input
          className="field"
          type="tel"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              telefono: limpiarTelefono(event.target.value),
            }))
          }
        />
        <select
          className="field"
          value={form.estado}
          onChange={(event) =>
            setForm((current) => ({ ...current, estado: event.target.value }))
          }
        >
          <option value="activo">Activo</option>
          <option value="pendiente">Pendiente</option>
          <option value="suspendido">Suspendido</option>
        </select>

        {error ? (
          <p className=" border border-red-300/25 bg-red-500/10 px-4 py-3 text-sm text-red-100 lg:col-span-2">
            {error}
          </p>
        ) : null}

        <div className="lg:col-span-2">
          <button type="submit" className="primary-button">
            Guardar datos
          </button>
        </div>
      </form>
    </section>
  );
}
