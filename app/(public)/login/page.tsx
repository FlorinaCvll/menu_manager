import { redirect } from "next/navigation";
import { Monitor, ShieldCheck, Smartphone } from "lucide-react";
import FormularioLogin from "@/components/public/FormularioLogin";
import Marca from "@/components/shared/Marca";
import { obtenerSesion } from "@/lib/session";

const accesos = [
  {
    icon: Monitor,
    titulo: "Centro de Control",
    texto: "Panel avanzado para gestionar tu carta, equipo y estadísticas de rendimiento desde un único entorno.",
  },
  {
    icon: Smartphone,
    titulo: "Movilidad en Sala",
    texto: "Optimiza el flujo de trabajo gestionando comandas y consultando menús desde cualquier dispositivo móvil o PDA.",
  },
  {
    icon: ShieldCheck,
    titulo: "Acceso Seguro",
    texto: "Entornos de trabajo segmentados que garantizan la privacidad de tus datos y una gestión precisa de roles.",
  },
];

export default async function LoginPage() {
  const sesion = await obtenerSesion();
  if (sesion) {
    let rutaDestino;
    if (sesion.rol === "superadmin") {
      rutaDestino = "/superadmin/altas";
    } else if (sesion.rol === "admin") {
      rutaDestino = "/admin";
    } else {
      rutaDestino = "/camarero";
    }
    redirect(rutaDestino);
  }

  return (
      <div className="marco-publico flex flex-1 flex-col">
        <main
            className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-10">
          <section className="hidden lg:flex lg:flex-col lg:gap-6">
            <div className="glass-card-strong p-8">
              <Marca/>
              <div className="mt-10 max-w-xl space-y-4">
                <p className="pill">Acceso Privado</p>
                <h1 className="section-title text-5xl font-semibold text-white">
                  Acceso optimizado para la excelencia operativa.
                </h1>
                <p className="text-base leading-7 text-[var(--muted)]">
                  Diseñado para la rapidez. Una interfaz limpia y libre de distracciones que permite a tu equipo
                  centrarse exclusivamente en lo más importante: brindar un servicio impecable.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {accesos.map((item) => (
                  <div key={item.titulo} className="paper-panel p-5">
                    <item.icon className="h-5 w-5 text-[var(--accent-strong)]"/>
                    <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-stone-900">
                      {item.titulo}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-stone-700">{item.texto}</p>
                  </div>
              ))}
            </div>
          </section>

          <section className="flex items-center justify-center">
            <div className="w-full max-w-2xl space-y-5">
              <div className="glass-card px-5 py-4">
                <Marca compacta/>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
                  Accede a tu panel de gestión. ¿Tienes problemas de acceso o necesitas asistencia técnica? Nuestro
                  equipo está a una llamada o correo.
                </p>
              </div>

              <FormularioLogin/>

              <div className="paper-panel p-5 text-sm text-stone-700">
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-stone-500">
                  Entorno de pruebas
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <p>Negocio 1 - Admin 1 - PIN 1234</p>
                  <p>Negocio 1 - Camarera 2 - PIN 1111</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
  );
}