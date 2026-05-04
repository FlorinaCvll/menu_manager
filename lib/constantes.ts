export const navegacionAdminUsuarios = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/usuarios", label: "Usuarios" },
];

export const navegacionAdminRestaurante = [
  { href: "/admin/menus", label: "Menús" },
  { href: "/admin/postres", label: "Postres" },
  { href: "/admin/raciones", label: "Raciones" },
  { href: "/admin/historial", label: "Historial" },
  { href: "/admin/ajustes", label: "Negocio" },
];

export const navegacionAdmin = [
  ...navegacionAdminUsuarios,
  ...navegacionAdminRestaurante,
];

export const navegacionCamarero = [
  { href: "/camarero", label: "Panel" },
  { href: "/camarero/menuDia", label: "Menú del día" },
  { href: "/camarero/comandas", label: "Comandas" },
];
