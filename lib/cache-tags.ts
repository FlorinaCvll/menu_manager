import type {plato_tipoPlato} from "@/generated/prisma/client";

export function fechaTag(fecha: Date | string)
{
    return fecha instanceof Date ? fecha.toISOString().slice(0, 10) : fecha;
}

export const cacheTags = {
    negocio: (idNegocio: number) => `negocio:${idNegocio}:datos`,
    usuarios: (idNegocio: number) => `negocio:${idNegocio}:usuarios`,
    menus: (idNegocio: number) => `negocio:${idNegocio}:menus`,
    menuDia: (idNegocio: number, fecha: Date | string) =>
        `negocio:${idNegocio}:menu-dia:${fechaTag(fecha)}`,
    comandas: (idNegocio: number) => `negocio:${idNegocio}:comandas`,
    platoTipo: (tipo: plato_tipoPlato) => `platos:${tipo}`,
    solicitudesAlta: "solicitudes-alta",
};
