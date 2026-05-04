"use client";

type Props = {
  etiqueta?: string;
};

export default function BotonImprimir({ etiqueta = "Imprimir menu" }: Props) {
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
