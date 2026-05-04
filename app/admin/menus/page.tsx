import MenuManager from "@/components/admin/MenuManager";
import { requireAdmin } from "@/lib/auth";
import { fechaAInput, obtenerFechaSolo } from "@/lib/fechas";
import { prisma } from "@/lib/prisma";

export default async function MenusPage() {
  const sesion = await requireAdmin();
  const fechaMenu = obtenerFechaSolo();

  const menuHoy = await prisma.menu.findUnique({
    where: {
      idNegocio_fecha: {
        idNegocio: sesion.idNegocio,
        fecha: fechaMenu,
      },
    },
    include: {
      menu_plato: {
        include: {
          plato: true,
        },
      },
    },
  });

  const menuHoyAgrupado = menuHoy
    ? {
        fecha: fechaAInput(menuHoy.fecha),
        precio: Number(menuHoy.precio),
        precioMedio: Number(menuHoy.precioMedio),
        precioTerraza: Number(menuHoy.precioTerraza),
        datosAdicionales: menuHoy.datosAdicionales,
        primeros: menuHoy.menu_plato
          .filter((item) => item.plato.tipoPlato === "primero")
          .map((item) => item.plato.nombre),
        segundos: menuHoy.menu_plato
          .filter((item) => item.plato.tipoPlato === "segundo")
          .map((item) => item.plato.nombre),
        postres: menuHoy.menu_plato
          .filter((item) => item.plato.tipoPlato === "postre")
          .map((item) => item.plato.nombre),
      }
    : null;

  return <MenuManager menuHoy={menuHoyAgrupado} />;
}
