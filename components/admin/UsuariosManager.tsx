"use client";

import React, {useEffect, useRef, useState} from "react";
import {Pencil, Trash2, UserPlus} from "lucide-react";
import {limpiarTelefono} from "@/lib/telefono";

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

type EstadoFormulario = {
  nombre: string;
  apellidos: string;
  telefono: string;
  pin: string;
  rol: "admin" | "camarero";
  comentarios: string;
  activo: boolean;
};

const formularioInicial: EstadoFormulario = {
  nombre: "",
  apellidos: "",
  telefono: "",
  pin: "",
  rol: "camarero",
  comentarios: "",
  activo: true,
};

type Propiedades = {
    usuarios: Usuario[];
    idUsuarioActual: number;
};

type UsuarioApi = Omit<Usuario, "rol" | "fechaAlta" | "fechaBaja"> & {
    rol: string;
    fechaAlta?: Date | string | null;
    fechaBaja?: Date | string | null;
};

function serializarFecha(fecha: Date | string | null | undefined)
{
    if (!fecha)
    {
        return null;
    }

    return fecha instanceof Date ? fecha.toISOString() : fecha;
}

function normalizarUsuario(usuario: UsuarioApi): Usuario
{
    return {
        idPersona: usuario.idPersona,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        telefono: usuario.telefono,
        rol: usuario.rol === "admin" ? "admin" : "camarero",
        comentarios: usuario.comentarios,
        fechaAlta: serializarFecha(usuario.fechaAlta),
        fechaBaja: serializarFecha(usuario.fechaBaja),
    };
}

function ordenarUsuarios(usuarios: Usuario[])
{
    return [...usuarios].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

export default function UsuariosManager({usuarios, idUsuarioActual}: Propiedades)
{
  const [usuariosVisibles, setUsuariosVisibles] = useState(usuarios);
    const [formulario, setFormulario] = useState<EstadoFormulario>(formularioInicial);
    const [idEnEdicion, setIdEnEdicion] = useState<number | null>(null);
    const [idEnEliminacion, setIdEnEliminacion] = useState<number | null>(null);
  const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);
    const bajaEnCursoRef = useRef(false);

    useEffect(() =>
    {
        setUsuariosVisibles(usuarios);
    }, [usuarios]);

    async function manejarEnvio(event: React.SyntheticEvent<HTMLFormElement>)
    {
    event.preventDefault();
        setCargando(true);
    setError("");

        const rutaApi = idEnEdicion
            ? `/api/usuarios/${idEnEdicion}`
      : "/api/usuarios";
        const metodo = idEnEdicion ? "PUT" : "POST";

        const respuesta = await fetch(rutaApi, {
            method: metodo,
      headers: {
        "Content-Type": "application/json",
      },
            body: JSON.stringify(formulario),
    });

        const datos = await respuesta.json();

        if (!respuesta.ok)
        {
            setError(datos.error || "No se ha podido guardar el usuario.");
            setCargando(false);
      return;
    }

        const usuarioGuardado = normalizarUsuario(datos.item);
        setUsuariosVisibles((actual) =>
      {
          const sinUsuarioPrevio = actual.filter(
              (usuario) => usuario.idPersona !== usuarioGuardado.idPersona,
          );

          if (usuarioGuardado.fechaBaja)
          {
              return sinUsuarioPrevio;
          }

          return ordenarUsuarios([...sinUsuarioPrevio, usuarioGuardado]);
      });
        setFormulario(formularioInicial);
        setIdEnEdicion(null);
        setCargando(false);
  }

    function manejarEdicion(usuario: Usuario)
    {
        setIdEnEdicion(usuario.idPersona);
        setFormulario({
      nombre: usuario.nombre,
      apellidos: usuario.apellidos || "",
      telefono: usuario.telefono || "",
      pin: "",
      rol: usuario.rol,
      comentarios: usuario.comentarios || "",
      activo: !usuario.fechaBaja,
    });
  }

    async function manejarEliminacion(idPersona: number)
    {
        if (idPersona === idUsuarioActual)
      {
          setError("No puedes darte de baja a ti mismo.");
          return;
      }

      if (bajaEnCursoRef.current)
      {
          return;
      }

      bajaEnCursoRef.current = true;
        setIdEnEliminacion(idPersona);

    const confirmar = window.confirm(
      "Se dará de baja este usuario. ¿Quieres continuar?"
    );

    if (!confirmar) {
        bajaEnCursoRef.current = false;
        setIdEnEliminacion(null);
      return;
    }

        const respuesta = await fetch(`/api/usuarios/${idPersona}`, {
      method: "DELETE",
    });
        const datos = await respuesta.json();

        if (!respuesta.ok)
        {
            setError(datos.error || "No se ha podido dar de baja el usuario.");
        bajaEnCursoRef.current = false;
            setIdEnEliminacion(null);
      return;
    }

        setUsuariosVisibles((actual) =>
            actual.filter((usuario) => usuario.idPersona !== idPersona),
    );

        if (idEnEdicion === idPersona)
        {
            setIdEnEdicion(null);
            setFormulario(formularioInicial);
    }

      bajaEnCursoRef.current = false;
        setIdEnEliminacion(null);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
      <section className="glass-card p-6">
        <div className="flex items-center gap-3">
          <UserPlus className="h-7 w-7 text-[var(--accent)]" />
          <div>
            <h2 className="section-title text-2xl font-semibold text-white">
                {idEnEdicion ? "Editar usuario" : "Nuevo usuario"}
            </h2>
          </div>
        </div>

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
            placeholder="Apellidos"
            value={formulario.apellidos}
            onChange={(event) =>
                setFormulario((actual) => ({
                    ...actual,
                apellidos: event.target.value,
              }))
            }
          />
          <input
            className="field"
            type="tel"
            placeholder="Teléfono"
            value={formulario.telefono}
            onChange={(event) =>
                setFormulario((actual) => ({
                    ...actual,
                telefono: limpiarTelefono(event.target.value),
              }))
            }
          />
          <input
            className="field"
            placeholder={idEnEdicion ? "Nuevo PIN (opcional)" : "PIN"}
            type="password"
            value={formulario.pin}
            onChange={(event) =>
                setFormulario((actual) => ({...actual, pin: event.target.value}))
            }
          />
          <select
            className="field"
            value={formulario.rol}
            onChange={(event) =>
                setFormulario((actual) => ({
                    ...actual,
                    rol: event.target.value as EstadoFormulario["rol"],
              }))
            }
          >
            <option value="admin">Administrador</option>
            <option value="camarero">Camarero</option>
          </select>
          <textarea
            className="field min-h-28"
            placeholder="Comentarios"
            value={formulario.comentarios}
            onChange={(event) =>
                setFormulario((actual) => ({
                    ...actual,
                comentarios: event.target.value,
              }))
            }
          />

          <label className="flex items-center gap-3 border border-white/10 bg-white/5 px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={formulario.activo}
              onChange={(event) =>
                  setFormulario((actual) => ({
                      ...actual,
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
              <button type="submit" className="primary-button" disabled={cargando}>
                  {cargando ? "Guardando..." : idEnEdicion ? "Actualizar" : "Crear"}
            </button>
              {idEnEdicion ? (
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                    setIdEnEdicion(null);
                    setFormulario(formularioInicial);
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
                      ID de usuario: #{usuario.idPersona}
                  </p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
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
                    onClick={() => manejarEdicion(usuario)}
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                    {usuario.idPersona === idUsuarioActual ? (
                        <button
                            type="button"
                            className="secondary-button px-4 py-3 text-sm opacity-60"
                            disabled
                        >
                            Tu usuario
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="secondary-button px-4 py-3 text-sm text-red-100"
                            disabled={idEnEliminacion !== null}
                            onClick={() => manejarEliminacion(usuario.idPersona)}
                        >
                            <Trash2 className="h-4 w-4"/>
                            {idEnEliminacion === usuario.idPersona ? "Dando baja..." : "Baja"}
                        </button>
                    )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
