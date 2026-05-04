import type { persona_rol } from "@/generated/prisma/client";

export type UsuarioSesion = {
    idPersona: number;
    idNegocio: number;
    nombre: string;
    rol: persona_rol;
};