import { cookies } from "next/headers";
import type { UsuarioSesion } from "@/types/session";

const NOMBRE_COOKIE = "session";

export async function crearSesion(usuario: UsuarioSesion) {
    const cookieStore = await cookies();

    cookieStore.set(NOMBRE_COOKIE, JSON.stringify(usuario), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });
}

export async function obtenerSesion(): Promise<UsuarioSesion | null> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(NOMBRE_COOKIE);

    if (!cookie?.value) {
        return null;
    }

    try {
        return JSON.parse(cookie.value) as UsuarioSesion;
    } catch {
        return null;
    }
}

export async function eliminarSesion() {
    const cookieStore = await cookies();
    cookieStore.delete(NOMBRE_COOKIE);
}