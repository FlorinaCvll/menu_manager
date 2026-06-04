import "dotenv/config";
import {PrismaMariaDb} from "@prisma/adapter-mariadb";
import {PrismaClient} from "../generated/prisma/client";
import {persona_rol} from "../generated/prisma/enums";
import bcrypt from "bcryptjs";

const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🌱 SEED INICIADO");


    const pinAdminHash = await bcrypt.hash("1234", 10);
    const pinCamareroHash = await bcrypt.hash("1111", 10);
    const pinSuperAdminHash = await bcrypt.hash("9999", 10);

    const negocioPlataforma = await prisma.negocio.upsert({
        where: { idNegocio: 999 },
        update: {},
        create: {
            idNegocio: 999,
            nombre: "MenuManager Plataforma",
            direccion: "Panel interno",
            telefono: "000000000",
            estado: "activo",
            fechaAlta: new Date(),
            CIF_NIF: "MENUMANAGER",
        },
    });

    await prisma.persona.upsert({
        where: { idPersona: 999 },
        update: {},
        create: {
            idPersona: 999,
            nombre: "Superadmin",
            apellidos: "MenuManager",
            telefono: "000000000",
            pin: pinSuperAdminHash,
            rol: persona_rol.superadmin,
            fechaAlta: new Date(),
            comentarios: "Administrador de plataforma",
            idNegocio: negocioPlataforma.idNegocio,
        },
    });

    const negocio = await prisma.negocio.upsert({
        where: { idNegocio: 1 },
        update: {},
        create: {
            nombre: "Restaurante TFG",
            direccion: "Calle Mayor 1, Ávila",
            telefono: "920123456",
            estado: "activo",
            fechaAlta: new Date(),
            CIF_NIF: "B12345678",
        },
    });

    // 👤 ADMIN
    const admin = await prisma.persona.upsert({
        where: { idPersona: 1 },
        update: {},
        create: {
            nombre: "Rodrigo",
            apellidos: "Admin",
            telefono: "600000000",
            pin: pinAdminHash,
            rol: "admin",
            fechaAlta: new Date(),
            comentarios: "Administrador principal",
            idNegocio: negocio.idNegocio,
        },
    });

    // 👤 CAMARERO
    await prisma.persona.upsert({
        where: { idPersona: 2 },
        update: {},
        create: {
            nombre: "Lucia",
            apellidos: "Camarera",
            telefono: "611111111",
            pin: pinCamareroHash,
            rol: "camarero",
            fechaAlta: new Date(),
            comentarios: "Camarera de prueba",
            idNegocio: negocio.idNegocio,
        },
    });

    console.log("Usuarios creados");

    // 🍽️ PLATOS
    const plato1 = await prisma.plato.upsert({
        where: { idPlato: 1 },
        update: {},
        create: {
            nombre: "Ensalada mixta",
            precioIndividual: 8.5,
            tipoPlato: "primero",
            idNegocio: negocio.idNegocio,
        },
    });

    const plato2 = await prisma.plato.upsert({
        where: { idPlato: 2 },
        update: {},
        create: {
            nombre: "Lentejas",
            precioIndividual: 9,
            tipoPlato: "primero",
            idNegocio: negocio.idNegocio,
        },
    });

    const plato3 = await prisma.plato.upsert({
        where: { idPlato: 3 },
        update: {},
        create: {
            nombre: "Pollo asado",
            precioIndividual: 12.5,
            tipoPlato: "segundo",
            idNegocio: negocio.idNegocio,
        },
    });

    const plato4 = await prisma.plato.upsert({
        where: { idPlato: 4 },
        update: {},
        create: {
            nombre: "Merluza",
            precioIndividual: 13.5,
            tipoPlato: "segundo",
            idNegocio: negocio.idNegocio,
        },
    });

    const plato5 = await prisma.plato.upsert({
        where: { idPlato: 5 },
        update: {},
        create: {
            nombre: "Tarta queso",
            precioIndividual: 4.5,
            tipoPlato: "postre",
            idNegocio: negocio.idNegocio,
        },
    });

    const plato6 = await prisma.plato.upsert({
        where: { idPlato: 6 },
        update: {},
        create: {
            nombre: "Flan",
            precioIndividual: 4,
            tipoPlato: "postre",
            idNegocio: negocio.idNegocio,
        },
    });

    // 📅 MENU
    const menu = await prisma.menu.upsert({
        where: {
            idNegocio_fecha: {
                idNegocio: negocio.idNegocio,
                fecha: new Date(new Date().toISOString().split("T")[0]),
            },
        },
        update: {},
        create: {
            fecha: new Date(new Date().toISOString().split("T")[0]),
            precio: 15,
            precioMedio: 10,
            precioTerraza: 17,
            idPersona: admin.idPersona,
            idNegocio: negocio.idNegocio,
        },
    });

    await prisma.menu_plato.createMany({
        data: [
            { idMenu: menu.idMenu, idPlato: plato1.idPlato },
            { idMenu: menu.idMenu, idPlato: plato2.idPlato },
            { idMenu: menu.idMenu, idPlato: plato3.idPlato },
            { idMenu: menu.idMenu, idPlato: plato4.idPlato },
            { idMenu: menu.idMenu, idPlato: plato5.idPlato },
            { idMenu: menu.idMenu, idPlato: plato6.idPlato },
        ],
        skipDuplicates: true,
    });

    console.log("🌱 SEED COMPLETADO");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
