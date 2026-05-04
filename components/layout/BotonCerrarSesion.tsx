"use client";

import { useRouter } from "next/navigation";

export default function BotonCerrarSesion() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    localStorage.removeItem("usuario");
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="secondary-button text-sm"
    >
      Cerrar sesión
    </button>
  );
}
