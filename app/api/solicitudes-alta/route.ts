import bcrypt from "bcryptjs";
import {mkdir, writeFile} from "fs/promises";
import path from "path";
import {NextResponse} from "next/server";
import {jsonError, requireApiSession} from "@/lib/api";
import {prisma} from "@/lib/prisma";
import {createStripeCheckoutSession, shouldUseMockPayments} from "@/lib/stripe";

export const runtime = "nodejs";

const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024;
const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const ALLOWED_NUMERO_LOCALES = ["1", "2", "3", "4+"];

function getRequiredString(formData: FormData, field: string) {
  const value = String(formData.get(field) || "").trim();
  return value;
}

function esEmailValido(email: string)
{
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function esCifNifValido(valor: string)
{
    return /^[a-zA-Z0-9]{8,15}$/.test(valor.replace(/[\s-]/g, ""));
}

function esTelefonoValido(valor: string)
{
    return /^\+?\d{9,15}$/.test(valor.replace(/\s/g, ""));
}

function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.\-_]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

export async function GET() {
  const { error } = await requireApiSession(["superadmin"]);

  if (error) {
    return error;
  }

  const solicitudes = await prisma.solicitud_alta.findMany({
    orderBy: {
      fechaSolicitud: "desc",
    },
  });

  return NextResponse.json({ ok: true, items: solicitudes });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const nombreRestaurante = getRequiredString(formData, "nombreRestaurante");
    const cifNif = getRequiredString(formData, "cifNif");
    const personaContacto = getRequiredString(formData, "personaContacto");
    const email = getRequiredString(formData, "email");
    const telefono = getRequiredString(formData, "telefono");
    const direccion = getRequiredString(formData, "direccion");
    const ciudad = getRequiredString(formData, "ciudad");
    const numeroLocales = getRequiredString(formData, "numeroLocales") || "1";
    const comentarios = getRequiredString(formData, "comentarios");
    const adminPin = getRequiredString(formData, "adminPin");
    const documento = formData.get("documentoTitularidad");

    if (
      !nombreRestaurante ||
      !cifNif ||
      !personaContacto ||
      !email ||
      !telefono ||
      !direccion ||
      !ciudad ||
      !adminPin
    ) {
      return jsonError("Faltan datos obligatorios para preparar el alta.");
    }

    if (adminPin.length < 4 || adminPin.length > 20) {
      return jsonError("El PIN debe tener entre 4 y 20 caracteres.");
    }

      if (!esEmailValido(email))
      {
        return jsonError("El correo electrónico no es válido.");
      }

      if (!esCifNifValido(cifNif))
      {
          return jsonError("El CIF/NIF no es valido.");
      }

      if (!esTelefonoValido(telefono))
      {
          return jsonError("El telefono no es valido.");
      }

      if (!ALLOWED_NUMERO_LOCALES.includes(numeroLocales))
      {
          return jsonError("El numero de locales no es valido.");
      }

    if (!(documento instanceof File)) {
      return jsonError("Debes adjuntar el documento de titularidad.");
    }

    if (!ALLOWED_DOCUMENT_TYPES.includes(documento.type)) {
      return jsonError("El documento debe ser PDF, JPG o PNG.");
    }

    if (documento.size > MAX_DOCUMENT_SIZE) {
      return jsonError("El documento no puede superar los 5 MB.");
    }

    const extension = path.extname(documento.name) || ".pdf";
    const safeName = sanitizeFileName(
      `${Date.now()}-${nombreRestaurante}${extension}`,
    );
    const relativePath = `/uploads/solicitudes-alta/${safeName}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "solicitudes-alta");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(
      path.join(uploadDir, safeName),
      Buffer.from(await documento.arrayBuffer()),
    );

    const solicitud = await prisma.solicitud_alta.create({
      data: {
        nombreRestaurante,
        CIF_NIF: cifNif,
        personaContacto,
        email,
        telefono,
        direccion: `${direccion}, ${ciudad}`,
        ciudad,
        numeroLocales,
        comentarios: comentarios || null,
        documentoPropiedadUrl: relativePath,
        adminPinHash: await bcrypt.hash(adminPin, 10),
      },
    });

    const origin = new URL(request.url).origin;
    if (shouldUseMockPayments()) {
      return NextResponse.json({
        ok: true,
        checkoutUrl: `${origin}/pago-prueba?solicitud=${solicitud.idSolicitudAlta}`,
        solicitudId: solicitud.idSolicitudAlta,
      });
    }

    const checkoutSession = await createStripeCheckoutSession({
      solicitudId: solicitud.idSolicitudAlta,
      email,
      nombreRestaurante,
      origin,
    });

    await prisma.solicitud_alta.update({
      where: {
        idSolicitudAlta: solicitud.idSolicitudAlta,
      },
      data: {
        stripeCheckoutSessionId: checkoutSession.id,
      },
    });

    return NextResponse.json({
      ok: true,
      checkoutUrl: checkoutSession.url,
      solicitudId: solicitud.idSolicitudAlta,
    });
  } catch (error) {
    console.error("Error creando solicitud de alta:", error);
    return jsonError(
      error instanceof Error
        ? error.message
        : "No se ha podido preparar el pago.",
      500,
    );
  }
}
