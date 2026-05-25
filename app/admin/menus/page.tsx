import MenuManager from "@/components/admin/MenuManager";
import {requireAdmin} from "@/lib/auth";
import {fechaAInput, obtenerFechaSolo} from "@/lib/fechas";
import {obtenerMenuDiaCacheado} from "@/lib/consultas-cache";

export default async function MenusPage() {
  const sesion = await requireAdmin();
  const fechaMenu = obtenerFechaSolo();

    const menuHoy = await obtenerMenuDiaCacheado(sesion.idNegocio, fechaMenu);

  const menuHoyAgrupado = menuHoy
    ? {
        fecha: fechaAInput(menuHoy.fecha),
        precio: Number(menuHoy.precio),
        precioMedio: Number(menuHoy.precioMedio),
        precioTerraza: Number(menuHoy.precioTerraza),
        datosAdicionales: menuHoy.datosAdicionales,
        primeros: menuHoy.menu_plato
            .filter((item: { plato: { tipoPlato: string } }) => item.plato.tipoPlato === "primero")
            .map((item: { plato: { nombre: string } }) => item.plato.nombre),
        segundos: menuHoy.menu_plato
            .filter((item: { plato: { tipoPlato: string } }) => item.plato.tipoPlato === "segundo")
            .map((item: { plato: { nombre: string } }) => item.plato.nombre),
        postres: menuHoy.menu_plato
            .filter((item: { plato: { tipoPlato: string } }) => item.plato.tipoPlato === "postre")
            .map((item: { plato: { nombre: string } }) => item.plato.nombre),
      }
    : null;

  return <MenuManager menuHoy={menuHoyAgrupado} />;
}
