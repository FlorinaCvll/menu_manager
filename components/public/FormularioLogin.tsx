"use client";

import React, {useState} from "react";
import {useRouter} from "next/navigation";

export default function FormularioLogin() {
  const router = useRouter();
  const [idPersona, setIdPersona] = useState("");
  const [negocioAcceso, setNegocioAcceso] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function manejarEnvio(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setCargando(true);
    setError("");

    try {
      const respuesta = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idPersona,
          negocioAcceso,
          pin,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.error || "Credenciales incorrectas. Por favor, inténtalo de nuevo.");
        setCargando(false);
        return;
      }

      localStorage.setItem("usuario", JSON.stringify(datos.usuario));
      router.replace(
          datos.usuario.rol === "superadmin"
              ? "/superadmin/altas"
              : datos.usuario.rol === "admin"
                  ? "/admin"
                  : "/camarero",
      );
      router.refresh();
    } catch {
      setError("Error de conexión. Inténtalo de nuevo más tarde.");
    } finally {
      setCargando(false);
    }
  }

  return (
      <form onSubmit={manejarEnvio} className="glass-card p-6 sm:p-7">
        <div className="space-y-3">
          <p className="pill">Acceso profesional</p>
          <h1 className="section-title text-3xl font-semibold text-white">
            Acceso al panel de gestión
          </h1>
          <p className="max-w-xl text-sm leading-6 text-[var(--muted)]">
            Introduce las credenciales asignadas para acceder al entorno operativo de tu restaurante.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-[1.3rem] border border-white/10 bg-white/6 p-4">
            <label htmlFor="negocioAcceso" className="mb-2 block text-sm font-medium text-white/88">
              CIF/NIF de empresa o ID del establecimiento
            </label>
            <input
                id="negocioAcceso"
                type="text"
                className="field appearance-none"
                value={negocioAcceso}
                onChange={(event) => setNegocioAcceso(event.target.value.trim())}
                placeholder="Ej: B12345678"
                required
            />
          </div>

          <div className="rounded-[1.3rem] border border-white/10 bg-white/6 p-4">
            <label htmlFor="idPersona" className="mb-2 block text-sm font-medium text-white/88">
                ID de usuario <span className="text-white/55">(obligatorio para camareros)</span>
            </label>
            <input
                id="idPersona"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="field appearance-none"
                value={idPersona}
                onChange={(event) => setIdPersona(event.target.value)}
                placeholder="Ej: 2"
            />
            <p className="mt-2 text-xs leading-5 text-white/58">
                Los administradores pueden dejarlo vacio. Camareros deben indicar su ID de usuario y su PIN.
            </p>
          </div>

          <div className="rounded-[1.3rem] border border-white/10 bg-white/6 p-4">
            <label htmlFor="pin" className="mb-2 block text-sm font-medium text-white/88">
              PIN de acceso
            </label>
            <input
                id="pin"
                type="password"
                className="field"
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                placeholder="••••"
                maxLength={20}
                required
            />
          </div>
        </div>

        {error ? (
            <p className="mt-4 rounded-[1.1rem] border border-red-300/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1 text-sm text-slate-100/78">
            <p>¿Necesitas ayuda para acceder?</p>
            <p className="text-xs opacity-70">Revisa tus credenciales o contacta con soporte.</p>
          </div>
          <button type="submit" className="primary-button w-full sm:w-auto" disabled={cargando}>
            {cargando ? "Validando..." : "Acceder"}
          </button>
        </div>
      </form>
  );
}
