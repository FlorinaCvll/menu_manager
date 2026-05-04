import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import type { UsuarioSesion } from "@/types/session";
import { prisma } from "@/lib/prisma";
import { crearSesion } from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idPersona = Number(body.idPersona);
    const negocioAcceso = String(body.negocioAcceso || body.idNegocio || "").trim();
    const idNegocio = Number(negocioAcceso);
    const pin = String(body.pin || "");

    if (!negocioAcceso || !pin) {
      return NextResponse.json(
        { ok: false, error: "Debes indicar CIF/NIF o negocio y PIN." },
        { status: 400 }
      );
    }

    const negocio = await prisma.negocio.findFirst({
      where: Number.isFinite(idNegocio) && idNegocio > 0
        ? {
            idNegocio,
          }
        : {
            CIF_NIF: negocioAcceso,
          },
    });

    if (!negocio) {
      return NextResponse.json(
        { ok: false, error: "Negocio no encontrado." },
        { status: 401 }
      );
    }

    const usuario = await prisma.persona.findFirst({
      where: idPersona
        ? {
            idPersona,
            idNegocio: negocio.idNegocio,
          }
        : {
            idNegocio: negocio.idNegocio,
            rol: negocio.idNegocio === 999 ? "superadmin" : "admin",
            fechaBaja: null,
          },
      include: {
        negocio: true,
      },
      orderBy: {
        idPersona: "asc",
      },
    });

    if (!usuario) {
      return NextResponse.json(
        {
          ok: false,
          error: idPersona
            ? "Usuario no encontrado."
            : "No se ha encontrado un usuario administrador para este negocio.",
        },
        { status: 401 }
      );
    }

    if (usuario.fechaBaja) {
      return NextResponse.json(
        { ok: false, error: "Este usuario está dado de baja." },
        { status: 403 }
      );
    }

    if (usuario.negocio.estado !== "activo") {
      return NextResponse.json(
        { ok: false, error: "El negocio todavía no está activo." },
        { status: 403 }
      );
    }

    let pinValido = usuario.pin === pin;

    if (!pinValido) {
      try {
        pinValido = await bcrypt.compare(pin, usuario.pin);
      } catch {
        pinValido = false;
      }
    }

    if (!pinValido) {
      return NextResponse.json(
        { ok: false, error: "PIN incorrecto." },
        { status: 401 }
      );
    }

    const datosSesion: UsuarioSesion = {
      idPersona: usuario.idPersona,
      idNegocio: usuario.idNegocio,
      nombre: usuario.nombre,
      rol: usuario.rol,
    };

    await crearSesion(datosSesion);

    return NextResponse.json({
      ok: true,
      usuario: datosSesion,
    });
  } catch (error) {
    console.error("Error login:", error);

    return NextResponse.json(
      { ok: false, error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
