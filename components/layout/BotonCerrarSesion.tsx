"use client";

import {useRouter} from "next/navigation";

export default function BotonCerrarSesion() {
    const enrutador = useRouter();

    async function manejarCierreSesion()
    {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    localStorage.removeItem("usuario");
        enrutador.replace("/login");
        enrutador.refresh();
  }

  return (
    <button
      type="button"
      onClick={manejarCierreSesion}
      className="secondary-button text-sm"
    >
      Cerrar sesión
    </button>
  );
}
