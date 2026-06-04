"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {CalendarDays, ClipboardList, PlusCircle, ReceiptText, Soup, UtensilsCrossed,} from "lucide-react";
import {refrescarVista} from "@/lib/refrescar-vista";
import {fechaAInput} from "@/lib/fechas";

type Propiedades = {
  menuHoy:
    | {
        fecha: string;
        precio: number;
        precioMedio: number;
        precioTerraza: number;
        datosAdicionales: string | null;
        primeros: string[];
        segundos: string[];
        postres: string[];
      }
    | null;
};

function limpiarLinea(linea: string) {
  return linea
    .replace(/^\s*(?:[-*•]\s*|\d+[.)-]\s*)/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function convertirTextoEnLista(texto: string) {
  return texto
    .split("\n")
    .map(limpiarLinea)
    .filter(Boolean);
}

function PasoTexto({
  titulo,
  ayuda,
  icon: Icon,
  placeholder,
  value,
  onChange,
}: {
  titulo: string;
  ayuda?: string;
  icon: typeof Soup;
  placeholder: string;
  value: string;
  onChange: (texto: string) => void;
}) {
  return (
    <section className="step-card">
      <div className="flex items-start gap-3">
        <span className=" bg-white/10 p-3">
          <Icon className="h-5 w-5 text-[var(--accent)]" />
        </span>
        <div>
          <h3 className="section-title text-2xl font-semibold text-white">
            {titulo}
          </h3>
          <p className="mt-1 text-sm text-emerald-50/90">{ayuda}</p>
        </div>
      </div>

      <textarea
        className="field mt-5 min-h-40"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </section>
  );
}

export default function MenuManager({menuHoy}: Propiedades)
{
    const enrutador = useRouter();
  const [fecha, setFecha] = useState(
    menuHoy?.fecha || fechaAInput(new Date())
  );
  const [precio, setPrecio] = useState(String(menuHoy?.precio ?? 15));
  const [precioMedio, setPrecioMedio] = useState(
    String(menuHoy?.precioMedio ?? 10)
  );
  const [precioTerraza, setPrecioTerraza] = useState(
    String(menuHoy?.precioTerraza ?? 17)
  );
  const [datosAdicionales, setDatosAdicionales] = useState(
    menuHoy?.datosAdicionales || ""
  );
  const [primerosTexto, setPrimerosTexto] = useState(
    menuHoy?.primeros.join("\n") || ""
  );
  const [segundosTexto, setSegundosTexto] = useState(
    menuHoy?.segundos.join("\n") || ""
  );
  const [postresTexto, setPostresTexto] = useState(
    menuHoy?.postres.join("\n") || ""
  );
  const [error, setError] = useState("");
    const [exito, setExito] = useState("");

    async function manejarEnvio(event: React.FormEvent<HTMLFormElement>)
    {
    event.preventDefault();
    setError("");
        setExito("");

        const respuesta = await fetch("/api/menus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fecha,
        precio,
        precioMedio,
        precioTerraza,
        datosAdicionales,
        primeros: convertirTextoEnLista(primerosTexto),
        segundos: convertirTextoEnLista(segundosTexto),
        postres: convertirTextoEnLista(postresTexto),
      }),
    });

        const datos = await respuesta.json();

        if (!respuesta.ok)
        {
            setError(datos.error || "No se ha podido guardar el menú.");
      return;
    }

        setExito(`Menú guardado correctamente para ${fecha}.`);
        refrescarVista(enrutador);
  }

  return (
      <form onSubmit={manejarEnvio} className="glass-card p-6">
      <div className="flex items-center gap-3">
        <PlusCircle className="h-7 w-7 text-[var(--accent)]" />
        <div>
          <h2 className="section-title text-2xl font-semibold text-white">
            Crear menú diario
          </h2>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <section className="step-card">
          <div className="flex items-start gap-3">
            <span className="bg-white/10 p-3">
              <CalendarDays className="h-5 w-5 text-[var(--accent)]" />
            </span>
            <div>
              <h3 className="section-title text-2xl font-semibold text-white">
                1. Configura el día
              </h3>
              <p className="mt-1 text-sm text-emerald-50/90">
                Indica fecha y precios.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-white">
              <span>Fecha del menú</span>
              <input
                type="date"
                className="field"
                value={fecha}
                onChange={(event) => setFecha(event.target.value)}
                required
              />
            </label>
            <label className="space-y-2 text-sm text-white">
              <span>Precio menú</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="field"
                value={precio}
                onChange={(event) => setPrecio(event.target.value)}
                required
              />
            </label>
            <label className="space-y-2 text-sm text-white">
              <span>Precio medio menú</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="field"
                value={precioMedio}
                onChange={(event) => setPrecioMedio(event.target.value)}
                required
              />
            </label>
            <label className="space-y-2 text-sm text-white">
              <span>Precio terraza</span>
              <input
                type="number"
                min="0"
                step="0.01"
                className="field"
                value={precioTerraza}
                onChange={(event) => setPrecioTerraza(event.target.value)}
                required
              />
            </label>
          </div>
        </section>

        <PasoTexto
            titulo="2. Primeros"
          icon={Soup}
          placeholder={"Ejemplo:\nEnsalada mixta\nLentejas caseras\nGazpacho"}
          value={primerosTexto}
          onChange={setPrimerosTexto}
        />

        <PasoTexto
            titulo="3. Segundos"
          icon={UtensilsCrossed}
          placeholder={"Ejemplo:\nPollo asado\nMerluza al horno\nAlbóndigas en salsa"}
          value={segundosTexto}
          onChange={setSegundosTexto}
        />

        <PasoTexto
            titulo="4. Postres"
          icon={ReceiptText}
          placeholder={"Ejemplo:\nTarta de queso\nFlan casero"}
          value={postresTexto}
          onChange={setPostresTexto}
        />

        <section className="step-card">
          <div className="flex items-start gap-3">
            <span className=" bg-white/10 p-3">
              <ClipboardList className="h-5 w-5 text-[var(--accent)]" />
            </span>
            <div>
              <h3 className="section-title text-2xl font-semibold text-white">
                5. Observaciones
              </h3>
              <p className="mt-1 text-sm text-emerald-50/90">
                Añade una nota corta si el menú incluye pan, bebida o algo especial.
              </p>
            </div>
          </div>

          <textarea
            className="field mt-5 min-h-28"
            placeholder="Ejemplo: Incluye pan, bebida y café."
            value={datosAdicionales}
            onChange={(event) => setDatosAdicionales(event.target.value)}
          />
        </section>

        {error ? (
          <p className=" border border-red-200/35 bg-red-500/15 px-4 py-3 text-sm text-red-50">
            {error}
          </p>
        ) : null}

          {exito ? (
          <p className=" border border-emerald-200/35 bg-emerald-200/18 px-4 py-3 text-sm text-emerald-50">
              {exito}
          </p>
        ) : null}

        <div className="flex justify-end">
          <button type="submit" className="primary-button">
            Guardar menú del día
          </button>
        </div>
      </div>
    </form>
  );
}
