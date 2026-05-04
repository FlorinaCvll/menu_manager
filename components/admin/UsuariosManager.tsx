"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { refrescarVista } from "@/lib/refrescar-vista";
import { limpiarTelefono } from "@/lib/telefono";

type Usuario = {
  idPersona: number;
  nombre: string;
  apellidos: string | null;
  telefono: string | null;
  rol: "admin" | "camarero";
  comentarios: string | null;
  fechaAlta: string | null;
  fechaBaja: string | null;
};

type FormState = {
  nombre: string;
  apellidos: string;
  telefono: string;
  pin: string;
  rol: "admin" | "camarero";
  comentarios: string;
  activo: boolean;
};

const initialForm: FormState = {
  nombre: "",
  apellidos: "",
  telefono: "",
  pin: "",
  rol: "camarero",
  comentarios: "",
  activo: true,
};

export default function UsuariosManager({ usuarios }: { usuarios: Usuario[] }) {
  const router = useRouter();
  const [usuariosVisibles, setUsuariosVisibles] = useState(usuarios);
  const [form, setForm] = useState<FormState>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = editingId
      ? `/api/usuarios/${editingId}`
      : "/api/usuarios";
    const method = editingId ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "No se ha podido guardar el usuario.");
      setLoading(false);
      return;
    }

    setForm(initialForm);
    setEditingId(null);
    setLoading(false);
    refrescarVista(router);
  }

  function handleEdit(usuario: Usuario) {
    setEditingId(usuario.idPersona);
    setForm({
      nombre: usuario.nombre,
      apellidos: usuario.apellidos || "",
      telefono: usuario.telefono || "",
      pin: "",
      rol: usuario.rol,
      comentarios: usuario.comentarios || "",
      activo: !usuario.fechaBaja,
    });
  }

  async function handleDelete(idPersona: number) {
    const confirmar = window.confirm(
      "Se dará de baja este usuario. ¿Quieres continuar?"
    );

    if (!confirmar) {
      return;
    }

    const response = await fetch(`/api/usuarios/${idPersona}`, {
      method: "DELETE",
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "No se ha podido dar de baja el usuario.");
      return;
    }

    setUsuariosVisibles((current) =>
      current.filter((usuario) => usuario.idPersona !== idPersona),
    );

    if (editingId === idPersona) {
      setEditingId(null);
      setForm(initialForm);
    }

    refrescarVista(router);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
      <section className="glass-card p-6">
        <div className="flex items-center gap-3">
          <UserPlus className="h-7 w-7 text-[var(--accent)]" />
          <div>
            <h2 className="section-title text-2xl font-semibold text-white">
              {editingId ? "Editar usuario" : "Nuevo usuario"}
            </h2>
          </div>
        </div>

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
            placeholder="Apellidos"
            value={form.apellidos}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                apellidos: event.target.value,
              }))
            }
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
          <input
            className="field"
            placeholder={editingId ? "Nuevo PIN (opcional)" : "PIN"}
            type="password"
            value={form.pin}
            onChange={(event) =>
              setForm((current) => ({ ...current, pin: event.target.value }))
            }
          />
          <select
            className="field"
            value={form.rol}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                rol: event.target.value as FormState["rol"],
              }))
            }
          >
            <option value="admin">Administrador</option>
            <option value="camarero">Camarero</option>
          </select>
          <textarea
            className="field min-h-28"
            placeholder="Comentarios"
            value={form.comentarios}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                comentarios: event.target.value,
              }))
            }
          />

          <label className="flex items-center gap-3 border border-white/10 bg-white/5 px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  activo: event.target.checked,
                }))
              }
            />
            Usuario activo
          </label>

          {error ? (
            <p className=" border border-red-300/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Guardando..." : editingId ? "Actualizar" : "Crear"}
            </button>
            {editingId ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setEditingId(null);
                  setForm(initialForm);
                  setError("");
                }}
              >
                Cancelar edición
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="glass-card p-6">
        <div>
          <h2 className="section-title text-2xl font-semibold text-white">
            Personal del negocio
          </h2>
          <p className="text-sm text-[var(--muted)]">
            {usuariosVisibles.length} usuarios registrados.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {usuariosVisibles.map((usuario) => (
            <article
              key={usuario.idPersona}
              className=" border border-white/10 bg-white/6 p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">
                      {usuario.nombre} {usuario.apellidos || ""}
                    </h3>
                    <span className="pill text-xs uppercase">
                      {usuario.rol}
                    </span>
                    <span
                      className={`pill text-xs ${
                        usuario.fechaBaja ? "text-amber-200" : "text-emerald-100"
                      }`}
                    >
                      {usuario.fechaBaja ? "Inactivo" : "Activo"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Teléfono: {usuario.telefono || "No indicado"}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {usuario.comentarios || "Sin comentarios"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="secondary-button px-4 py-3 text-sm"
                    onClick={() => handleEdit(usuario)}
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    type="button"
                    className="secondary-button px-4 py-3 text-sm text-red-100"
                    onClick={() => handleDelete(usuario.idPersona)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Baja
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
