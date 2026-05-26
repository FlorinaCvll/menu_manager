import {unstable_cache} from "next/cache";
import type {plato_tipoPlato} from "@/generated/prisma/client";
import {cacheTags, fechaTag} from "@/lib/cache-tags";
import {prisma} from "@/lib/prisma";

export function obtenerNegocioCacheado(idNegocio: number)
{
    return unstable_cache(
        () =>
            prisma.negocio.findUniqueOrThrow({
                where: {idNegocio},
            }),
        ["negocio", String(idNegocio)],
        {tags: [cacheTags.negocio(idNegocio)]}
    )();
}

export function obtenerUsuariosCacheados(idNegocio: number)
{
    return unstable_cache(
        () =>
            prisma.persona.findMany({
                where: {
                    idNegocio,
                    fechaBaja: null,
                    rol: {
                        in: ["admin", "camarero"],
                    },
                },
                orderBy: [{fechaBaja: "asc"}, {nombre: "asc"}],
            }),
        ["usuarios", String(idNegocio)],
        {tags: [cacheTags.usuarios(idNegocio)]}
    )();
}

export function obtenerPlatosPorTipoCacheados(tipoPlato: plato_tipoPlato)
{
    return unstable_cache(
        () =>
            prisma.plato.findMany({
                where: {tipoPlato},
                orderBy: {
                    nombre: "asc",
                },
            }),
        ["platos", tipoPlato],
        {tags: [cacheTags.platoTipo(tipoPlato)]}
    )();
}

export function obtenerMenuDiaCacheado(idNegocio: number, fecha: Date)
{
    const fechaClave = fechaTag(fecha);

    return unstable_cache(
        () =>
            prisma.menu.findFirst({
                where: {
                    idNegocio,
                    fecha,
                },
                include: {
                    menu_plato: {
                        include: {
                            plato: true,
                        },
                    },
                },
            }),
        ["menu-dia", String(idNegocio), fechaClave],
        {tags: [cacheTags.menuDia(idNegocio, fechaClave), cacheTags.menus(idNegocio)]}
    )();
}

export function obtenerHistorialMenusCacheado(idNegocio: number)
{
    return unstable_cache(
        () =>
            prisma.menu.findMany({
                where: {
                    idNegocio,
                },
                orderBy: {
                    fecha: "desc",
                },
                include: {
                    persona: true,
                    menu_plato: {
                        include: {
                            plato: true,
                        },
                    },
                },
            }),
        ["historial-menus", String(idNegocio)],
        {tags: [cacheTags.menus(idNegocio)]}
    )();
}

export function obtenerComandasDiaCacheadas(idNegocio: number, hoy: Date)
{
    const fechaClave = fechaTag(hoy);

    return unstable_cache(
        () =>
            prisma.comanda.findMany({
                where: {
                    idNegocio,
                    fecha: {
                        gte: hoy,
                    },
                },
                orderBy: {
                    fecha: "desc",
                },
            }),
        ["comandas-dia", String(idNegocio), fechaClave],
        {tags: [cacheTags.comandas(idNegocio)]}
    )();
}

export function obtenerComandaCacheada(idNegocio: number, idComanda: number)
{
    return unstable_cache(
        () =>
            prisma.comanda.findFirst({
                where: {
                    idComanda,
                    idNegocio,
                },
            }),
        ["comanda", String(idNegocio), String(idComanda)],
        {tags: [cacheTags.comandas(idNegocio)]}
    )();
}

export function obtenerSolicitudesAltaCacheadas()
{
    return unstable_cache(
        () =>
            prisma.solicitud_alta.findMany({
                orderBy: {
                    fechaSolicitud: "desc",
                },
            }),
        ["solicitudes-alta"],
        {tags: [cacheTags.solicitudesAlta]}
    )();
}
