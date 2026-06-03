import {cookies} from "next/headers";
import crypto from "crypto";
import type {UsuarioSesion} from "@/types/session";

const NOMBRE_COOKIE = "session";
const DURACION_SESION_SEGUNDOS = 60 * 60 * 8;

type SesionFirmada = UsuarioSesion & {
    expiraEn: number;
};

function obtenerSecretoSesion()
{
    return (
        process.env.SESSION_SECRET ||
        process.env.NEXTAUTH_SECRET ||
        process.env.STRIPE_SECRET_KEY ||
        process.env.DATABASE_URL ||
        "menu-manager-dev-session-secret"
    );
}

function codificarBase64Url(valor: string)
{
    return Buffer.from(valor, "utf8").toString("base64url");
}

function decodificarBase64Url(valor: string)
{
    return Buffer.from(valor, "base64url").toString("utf8");
}

function firmar(valor: string)
{
    return crypto
        .createHmac("sha256", obtenerSecretoSesion())
        .update(valor)
        .digest("base64url");
}

function crearValorCookie(usuario: UsuarioSesion)
{
    const sesion: SesionFirmada = {
        ...usuario,
        expiraEn: Date.now() + DURACION_SESION_SEGUNDOS * 1000,
    };
    const payload = codificarBase64Url(JSON.stringify(sesion));

    return `${payload}.${firmar(payload)}`;
}

function leerValorCookie(valor: string): UsuarioSesion | null
{
    const [payload, firmaRecibida] = valor.split(".");

    if (!payload || !firmaRecibida)
    {
        return null;
    }

    const firmaEsperada = firmar(payload);
    const firmaRecibidaBuffer = Buffer.from(firmaRecibida);
    const firmaEsperadaBuffer = Buffer.from(firmaEsperada);

    if (
        firmaRecibidaBuffer.length !== firmaEsperadaBuffer.length ||
        !crypto.timingSafeEqual(firmaRecibidaBuffer, firmaEsperadaBuffer)
    )
    {
        return null;
    }

    const sesion = JSON.parse(decodificarBase64Url(payload)) as SesionFirmada;

    if (!sesion.expiraEn || sesion.expiraEn < Date.now())
    {
        return null;
    }

    return {
        idPersona: sesion.idPersona,
        idNegocio: sesion.idNegocio,
        nombre: sesion.nombre,
        rol: sesion.rol,
    };
}

export async function crearSesion(usuario: UsuarioSesion) {
    const cookieStore = await cookies();

    cookieStore.set(NOMBRE_COOKIE, crearValorCookie(usuario), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: DURACION_SESION_SEGUNDOS,
    });
}

export async function obtenerSesion(): Promise<UsuarioSesion | null> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(NOMBRE_COOKIE);

    if (!cookie?.value) {
        return null;
    }

    try {
        return leerValorCookie(cookie.value);
    } catch {
        return null;
    }
}

export async function eliminarSesion() {
    const cookieStore = await cookies();
    cookieStore.delete(NOMBRE_COOKIE);
}
