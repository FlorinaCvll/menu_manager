"use client";

import React, { useState } from "react";
import {
  ArrowRight,
  Building2,
  Store,
  Upload,
} from "lucide-react";
import { limpiarTelefono } from "@/lib/telefono";

type DatosCompra = {
  nombreRestaurante: string;
  cifNif: string;
  personaContacto: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  numeroLocales: string;
  adminPin: string;
  comentarios: string;
};

const datosIniciales: DatosCompra = {
  nombreRestaurante: "",
  cifNif: "",
  personaContacto: "",
  email: "",
  telefono: "",
  direccion: "",
  ciudad: "",
  numeroLocales: "1",
  adminPin: "",
  comentarios: "",
};

type FormularioCompraEmpresaProps = {
  mostrarFormulario: boolean;
  onMostrarFormulario: () => void;
};

export default function FormularioCompraEmpresa({
                                                  mostrarFormulario,
                                                  onMostrarFormulario,
                                                }: FormularioCompraEmpresaProps)
{
  const [datosCompra, setDatosCompra] = useState(datosIniciales);
  const [documentoTitularidad, setDocumentoTitularidad] = useState<File | null>(
    null,
  );
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  function actualizarCampo(campo: keyof DatosCompra, valor: string) {
    setDatosCompra((previo) => ({
      ...previo,
      [campo]: valor,
    }));
  }

  async function manejarEnvio(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!documentoTitularidad) {
      setError("Debes adjuntar el documento de titularidad.");
      return;
    }

    setCargando(true);

    try {
      const formData = new FormData();
      Object.entries(datosCompra).forEach(([campo, valor]) => {
        formData.append(campo, valor);
      });
      formData.append("documentoTitularidad", documentoTitularidad);

      const respuesta = await fetch("/api/solicitudes-alta", {
        method: "POST",
        body: formData,
      });
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.error || "No se ha podido preparar el pago.");
        return;
      }

      window.location.href = datos.checkoutUrl;
    } catch {
      setError("Ha ocurrido un error preparando el pago.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <section
      id="compra"
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <article className="glass-card p-7 sm:p-8">
          <p className="pill text-white">Alta empresarial</p>
          <h2 className="section-title mt-5 text-4xl font-semibold text-white sm:text-5xl">
            Solicita la activación de MenuManager para tu restaurante.
          </h2>
          <p className="mt-5 text-base leading-7 text-[var(--muted)]">
            Facilítanos los datos fiscales y operativos del establecimiento.
            Revisaremos la solicitud y prepararemos el entorno inicial para tu equipo.
          </p>

          <div className="mt-7 space-y-4">
            <div className="paper-panel p-5">
              <p className="paper-tag">
                <Store className="h-4 w-4" />
                Información necesaria
              </p>
              <p className="mt-3 text-sm leading-6 text-stone-700">
                Nombre comercial, CIF/NIF, dirección, datos de contacto y documento
                acreditativo de titularidad. Estos datos permiten validar el alta y
                configurar el acceso inicial con garantías.
              </p>
            </div>
          </div>

          {!mostrarFormulario ? (
            <button
              type="button"
              onClick={onMostrarFormulario}
              className="primary-button mt-8"
            >
              Solicitar alta
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : null}
        </article>

        <article className="paper-panel p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="paper-tag">
                <Building2 className="h-4 w-4" />
                Datos de empresa
              </p>
              <h3 className="section-title mt-4 text-3xl font-semibold text-stone-900">
                Formulario de alta
              </h3>
            </div>
          </div>

          {mostrarFormulario ? (
            <form onSubmit={manejarEnvio} className="mt-7 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="nombreRestaurante"
                    className="mb-2 block text-sm font-medium text-stone-800"
                  >
                    Nombre del restaurante
                  </label>
                  <input
                    id="nombreRestaurante"
                    className="w-full rounded-[1rem] border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-[var(--accent-strong)]"
                    value={datosCompra.nombreRestaurante}
                    onChange={(event) =>
                      actualizarCampo("nombreRestaurante", event.target.value)
                    }
                    placeholder="Ejemplo: Casa Manolo"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="cifNif"
                    className="mb-2 block text-sm font-medium text-stone-800"
                  >
                    CIF / NIF
                  </label>
                  <input
                    id="cifNif"
                    className="w-full rounded-[1rem] border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-[var(--accent-strong)]"
                    value={datosCompra.cifNif}
                    onChange={(event) => actualizarCampo("cifNif", event.target.value)}
                    placeholder="B12345678"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="personaContacto"
                    className="mb-2 block text-sm font-medium text-stone-800"
                  >
                    Persona de contacto
                  </label>
                  <input
                    id="personaContacto"
                    className="w-full rounded-[1rem] border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-[var(--accent-strong)]"
                    value={datosCompra.personaContacto}
                    onChange={(event) =>
                      actualizarCampo("personaContacto", event.target.value)
                    }
                    placeholder="Nombre y apellidos"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="telefono"
                    className="mb-2 block text-sm font-medium text-stone-800"
                  >
                    Teléfono
                  </label>
                  <input
                    id="telefono"
                    type="tel"
                    className="w-full rounded-[1rem] border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-[var(--accent-strong)]"
                    value={datosCompra.telefono}
                    onChange={(event) =>
                      actualizarCampo("telefono", limpiarTelefono(event.target.value))
                    }
                    placeholder="600 000 000"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-stone-800"
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full rounded-[1rem] border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-[var(--accent-strong)]"
                    value={datosCompra.email}
                    onChange={(event) => actualizarCampo("email", event.target.value)}
                    placeholder="contacto@restaurante.com"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="numeroLocales"
                    className="mb-2 block text-sm font-medium text-stone-800"
                  >
                    Número de locales
                  </label>
                  <select
                    id="numeroLocales"
                    className="w-full rounded-[1rem] border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-[var(--accent-strong)]"
                    value={datosCompra.numeroLocales}
                    onChange={(event) =>
                      actualizarCampo("numeroLocales", event.target.value)
                    }
                  >
                    <option value="1">1 local</option>
                    <option value="2">2 locales</option>
                    <option value="3">3 locales</option>
                    <option value="4+">4 o más</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="adminPin"
                  className="mb-2 block text-sm font-medium text-stone-800"
                >
                  PIN inicial de administrador
                </label>
                <input
                  id="adminPin"
                  type="password"
                  className="w-full rounded-[1rem] border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-[var(--accent-strong)]"
                  value={datosCompra.adminPin}
                  onChange={(event) => actualizarCampo("adminPin", event.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  minLength={4}
                  maxLength={20}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <label
                    htmlFor="direccion"
                    className="mb-2 block text-sm font-medium text-stone-800"
                  >
                    Dirección
                  </label>
                  <input
                    id="direccion"
                    className="w-full rounded-[1rem] border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-[var(--accent-strong)]"
                    value={datosCompra.direccion}
                    onChange={(event) =>
                      actualizarCampo("direccion", event.target.value)
                    }
                    placeholder="Calle, número y planta"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="ciudad"
                    className="mb-2 block text-sm font-medium text-stone-800"
                  >
                    Ciudad
                  </label>
                  <input
                    id="ciudad"
                    className="w-full rounded-[1rem] border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-[var(--accent-strong)]"
                    value={datosCompra.ciudad}
                    onChange={(event) => actualizarCampo("ciudad", event.target.value)}
                    placeholder="Madrid"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="documentoTitularidad"
                  className="mb-2 block text-sm font-medium text-stone-800"
                >
                  Documento de titularidad del negocio
                </label>
                <label
                  htmlFor="documentoTitularidad"
                  className="flex cursor-pointer flex-col gap-3 rounded-[1rem] border border-dashed border-stone-300 bg-white px-4 py-5 text-stone-900 transition hover:border-[var(--accent-strong)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="flex items-start gap-3">
                    <Upload className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent-strong)]" />
                    <span>
                      <span className="block text-sm font-semibold">
                        {documentoTitularidad
                          ? documentoTitularidad.name
                          : "Sube un PDF o imagen"}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-stone-600">
                        Escritura, licencia, recibo o documento que acredite que
                        el negocio pertenece a la persona que se registra.
                      </span>
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-stone-700">
                    Seleccionar archivo
                  </span>
                </label>
                <input
                  id="documentoTitularidad"
                  type="file"
                  className="sr-only"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(event) =>
                    setDocumentoTitularidad(event.target.files?.[0] || null)
                  }
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="comentarios"
                  className="mb-2 block text-sm font-medium text-stone-800"
                >
                  Comentarios
                </label>
                <textarea
                  id="comentarios"
                  className="min-h-28 w-full rounded-[1rem] border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-[var(--accent-strong)]"
                  value={datosCompra.comentarios}
                  onChange={(event) =>
                    actualizarCampo("comentarios", event.target.value)
                  }
                  placeholder="Indica cualquier necesidad operativa relevante: varios locales, usuarios iniciales o configuración específica."
                />
              </div>

              {error ? (
                <p className="rounded-[1.1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button type="submit" className="primary-button" disabled={cargando}>
                  {cargando ? "Preparando pago..." : "Continuar con el pago"}
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-7 rounded-[1.7rem] border border-dashed border-stone-300 px-5 py-8 text-center">
              <p className="text-base font-semibold text-stone-900">
                Pulsa en &quot;Solicitar alta&quot; para completar los datos de empresa.
              </p>

            </div>
          )}
        </article>
      </div>
    </section>
  );
}
