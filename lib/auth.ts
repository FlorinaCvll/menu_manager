import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/session";

export async function requireSuperAdmin() {
    const sesion = await obtenerSesion();

    if (!sesion) {
        redirect("/login");
    }

    if (sesion.rol !== "superadmin") {
        redirect("/admin");
    }

    return sesion;
}

export async function requireAdmin() {
    const sesion = await obtenerSesion();

    if (!sesion) {
        redirect("/login");
    }

    if (sesion.rol === "superadmin") {
        redirect("/superadmin/altas");
    }

    if (sesion.rol !== "admin") {
        redirect("/camarero");
    }

    return sesion;
}

export async function requireCamareroOAdmin() {
    const sesion = await obtenerSesion();

    if (!sesion) {
        redirect("/login");
    }

    if (sesion.rol !== "camarero" && sesion.rol !== "admin") {
        redirect("/login");
    }

    return sesion;
}
