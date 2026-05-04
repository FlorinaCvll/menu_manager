import UsuariosManager from "@/components/admin/UsuariosManager";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function UsuariosPage() {
  const sesion = await requireAdmin();
  const usuarios = await prisma.persona.findMany({
    where: {
      idNegocio: sesion.idNegocio,
      fechaBaja: null,
      rol: {
        in: ["admin", "camarero"],
      },
    },
    orderBy: [{ fechaBaja: "asc" }, { nombre: "asc" }],
  });

  return (
    <UsuariosManager
      usuarios={usuarios.map((usuario) => ({
        idPersona: usuario.idPersona,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        telefono: usuario.telefono,
        rol: usuario.rol as "admin" | "camarero",
        comentarios: usuario.comentarios,
        fechaAlta: usuario.fechaAlta?.toISOString() || null,
        fechaBaja: usuario.fechaBaja?.toISOString() || null,
      }))}
    />
  );
}
