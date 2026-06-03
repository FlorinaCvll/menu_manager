"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {refrescarVista} from "@/lib/refrescar-vista";

const estados = [
  { valor: "todas", label: "Todas" },
  { valor: "pendiente_pago", label: "Pago pendiente" },
  { valor: "pago_confirmado", label: "Pendientes de revisión" },
  { valor: "validada", label: "Validadas" },
  { valor: "rechazada", label: "Rechazadas" },
] as const;

type SolicitudAlta = {
  idSolicitudAlta: number;
  nombreRestaurante: string;
  CIF_NIF: string;
  personaContacto: string;
  email: string;
  telefono: string;
  direccion: string;
  numeroLocales: string;
  comentarios: string | null;
  documentoPropiedadUrl: string;
  estado: string;
  fechaSolicitud: string;
  fechaPago: string | null;
  idNegocioCreado: number | null;
  idPersonaAdminCreada: number | null;
};

type CredencialesActivacion = {
  idNegocio: number;
  idPersona: number;
};

export default function SolicitudesAltaManager({
  solicitudes,
}: {
  solicitudes: SolicitudAlta[];
}) {
    const enrutador = useRouter();
    const [elementos, setElementos] = useState(solicitudes);
  const [cargandoId, setCargandoId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<(typeof estados)[number]["valor"]>(
    "todas",
  );
  const [credenciales, setCredenciales] =
    useState<CredencialesActivacion | null>(null);

  useEffect(() => {
      setElementos(solicitudes);
  }, [solicitudes]);

  const resumen = {
      total: elementos.length,
      pendientePago: elementos.filter((elemento) => elemento.estado === "pendiente_pago").length,
      porRevisar: elementos.filter((elemento) => elemento.estado === "pago_confirmado").length,
      validadas: elementos.filter((elemento) => elemento.estado === "validada").length,
      rechazadas: elementos.filter((elemento) => elemento.estado === "rechazada").length,
  };

    const elementosFiltrados =
    filtroEstado === "todas"
        ? elementos
        : elementos.filter((elemento) => elemento.estado === filtroEstado);

  async function cambiarEstado(idSolicitudAlta: number, accion: "aprobar" | "rechazar") {
    setError("");
    setCargandoId(idSolicitudAlta);

    try {
      const respuesta = await fetch(`/api/solicitudes-alta/${idSolicitudAlta}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accion }),
      });
      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.error || "No se ha podido actualizar la solicitud.");
        return;
      }

        setElementos((actuales) =>
            actuales.map((elemento) =>
                elemento.idSolicitudAlta === idSolicitudAlta ? datos.solicitud || datos.item : elemento,
        ),
      );

      if (datos.credenciales) {
        setCredenciales(datos.credenciales);
      }

        refrescarVista(enrutador);
    } catch {
      setError("Se ha producido un error al actualizar la solicitud.");
    } finally {
      setCargandoId(null);
    }
  }

  return (
    <section className="glass-card p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="pill">Validación administrativa</p>
          <h2 className="section-title mt-4 text-3xl font-semibold text-white">
            Solicitudes de alta de restaurantes
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Revisa las altas recibidas, confirma que el pago y la documentación
            son correctos, y activa el negocio cuando todo está listo.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-5">
        {[
          ["Total", resumen.total],
          ["Pago pendiente", resumen.pendientePago],
          ["Pendientes de revisión", resumen.porRevisar],
          ["Validadas", resumen.validadas],
          ["Rechazadas", resumen.rechazadas],
        ].map(([label, value]) => (
          <div
            key={label}
            className="border border-white/10 bg-white/8 px-4 py-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-50/75">
              {label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {estados.map((estado) => (
          <button
            key={estado.valor}
            type="button"
            className={`px-4 py-2 text-sm font-semibold transition ${
              filtroEstado === estado.valor
                ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                : "border border-white/10 bg-white/8 text-white hover:bg-white/12"
            }`}
            onClick={() => setFiltroEstado(estado.valor)}
          >
            {estado.label}
          </button>
        ))}
      </div>

      <div className="mt-5 border border-amber-200/60 bg-amber-50 px-4 py-4 text-sm leading-6 text-stone-800 shadow-sm">
        Criterio de validación: el pago debe estar confirmado, la documentación debe
        ser legible y los datos del restaurante deben ser coherentes. Si la revisión
        es favorable, el negocio se activa en la plataforma.
      </div>

      {error ? (
        <p className="mt-5 border border-red-300/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {error}
        </p>
      ) : null}

      {credenciales ? (
        <div className="mt-5 border border-emerald-300/25 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-50">
          Negocio activado correctamente. Identificador interno del negocio: #
          {credenciales.idNegocio}. Usuario administrador creado: #
          {credenciales.idPersona}. El restaurante podra acceder con su CIF/NIF,
          este ID de usuario y el PIN indicado en el formulario de alta.
        </div>
      ) : null}

      <div className="mt-6 grid gap-4">
          {elementosFiltrados.length === 0 ? (
          <p className="paper-panel p-5 text-sm text-stone-700">
            No hay solicitudes que coincidan con el filtro seleccionado.
          </p>
        ) : null}

          {elementosFiltrados.map((solicitud) =>
          {
          const pagoConfirmado =
            solicitud.estado === "pago_confirmado" || solicitud.estado === "validada";
          const yaActivada = solicitud.estado === "validada";

          return (
            <article
              key={solicitud.idSolicitudAlta}
              className="paper-panel p-5"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                      {solicitud.estado.replaceAll("_", " ")}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-stone-950">
                      {solicitud.nombreRestaurante}
                    </h3>
                  </div>
                  <p className="text-sm leading-6 text-stone-700">
                    CIF/NIF: {solicitud.CIF_NIF} · Persona de contacto:{" "}
                    {solicitud.personaContacto} · {solicitud.email}
                  </p>
                  <p className="text-sm leading-6 text-stone-700">
                    {solicitud.direccion} · Teléfono: {solicitud.telefono} · Locales:{" "}
                    {solicitud.numeroLocales}
                  </p>
                  {solicitud.idNegocioCreado && solicitud.idPersonaAdminCreada ? (
                    <p className="text-sm font-semibold leading-6 text-emerald-800">
                      Negocio activado: #{solicitud.idNegocioCreado} · Usuario admin: #
                      {solicitud.idPersonaAdminCreada}
                    </p>
                  ) : null}
                  {solicitud.comentarios ? (
                    <p className="text-sm leading-6 text-stone-700">
                      Observaciones: {solicitud.comentarios}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2 text-sm">
                    <a
                      href={solicitud.documentoPropiedadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className=" bg-stone-900 px-4 py-2 font-semibold text-white"
                    >
                      Ver documentación
                    </a>
                    <span className=" bg-stone-100 px-4 py-2 font-semibold text-stone-800">
                      Pago {pagoConfirmado ? "confirmado" : "pendiente"}
                    </span>
                  </div>
                </div>

                <div className="flex min-w-[220px] flex-col gap-2">
                  <button
                    type="button"
                    className="primary-button justify-center disabled:opacity-55"
                    disabled={!pagoConfirmado || yaActivada || cargandoId === solicitud.idSolicitudAlta}
                    onClick={() => cambiarEstado(solicitud.idSolicitudAlta, "aprobar")}
                  >
                    {cargandoId === solicitud.idSolicitudAlta
                      ? "Procesando..."
                      : yaActivada
                        ? "Activada"
                        : "Aprobar solicitud"}
                  </button>
                  <button
                    type="button"
                    className="border border-stone-300 px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-stone-500 disabled:opacity-55"
                    disabled={yaActivada || solicitud.estado === "rechazada" || cargandoId === solicitud.idSolicitudAlta}
                    onClick={() => cambiarEstado(solicitud.idSolicitudAlta, "rechazar")}
                  >
                    Rechazar solicitud
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
