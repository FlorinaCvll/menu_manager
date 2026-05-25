type Negocio = {
  nombre: string;
  direccion: string;
  telefono: string | null;
  CIF_NIF: string;
  estado: string | null;
};

function CampoDato({
                       etiqueta,
                       valor,
                   }: {
    etiqueta: string;
    valor: string | null;
})
{
    return (
        <div className="border border-white/10 bg-white/6 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-50/70">
                {etiqueta}
            </p>
            <p className="mt-2 text-base font-semibold text-white">
                {valor || "No indicado"}
            </p>
        </div>
    );
}

export default function NegocioForm({ negocio }: { negocio: Negocio }) {
  return (
    <section className="glass-card p-6">
      <h2 className="section-title text-2xl font-semibold text-white">
        Datos del negocio
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
          Estos datos son fiscales y administrativos. Para evitar cambios
          accidentales, se muestran solo como consulta.
      </p>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <CampoDato etiqueta="Nombre" valor={negocio.nombre}/>
            <CampoDato etiqueta="CIF / NIF" valor={negocio.CIF_NIF}/>
        <div className="lg:col-span-2">
            <CampoDato etiqueta="Direccion" valor={negocio.direccion}/>
        </div>
            <CampoDato etiqueta="Telefono" valor={negocio.telefono}/>
            <CampoDato etiqueta="Estado" valor={negocio.estado || "activo"}/>
        </div>
    </section>
  );
}
