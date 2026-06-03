"use client";

type Propiedades = {
  etiqueta?: string;
};

export default function BotonImprimir({etiqueta = "Imprimir menu"}: Propiedades)
{
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="primary-button no-print"
    >
      {etiqueta}
    </button>
  );
}
