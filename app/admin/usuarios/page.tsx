import UsuariosManager from "@/components/admin/UsuariosManager";
import {requireAdmin} from "@/lib/auth";
import {obtenerUsuariosCacheados} from "@/lib/consultas-cache";

export default async function UsuariosPage() {
  const sesion = await requireAdmin();
    const usuarios = await obtenerUsuariosCacheados(sesion.idNegocio);

  return (
    <UsuariosManager
        currentUserId={sesion.idPersona}
        usuarios={usuarios.map(
            (usuario: {
                idPersona: number;
                nombre: string;
                apellidos: string | null;
                telefono: string | null;
                rol: string;
                comentarios: string | null;
                fechaAlta: Date | null;
                fechaBaja: Date | null;
            }) => ({
                idPersona: usuario.idPersona,
                nombre: usuario.nombre,
                apellidos: usuario.apellidos,
                telefono: usuario.telefono,
                rol: usuario.rol as "admin" | "camarero",
                comentarios: usuario.comentarios,
                fechaAlta: usuario.fechaAlta?.toISOString() || null,
                fechaBaja: usuario.fechaBaja?.toISOString() || null,
            })
        )}
    />
  );
}
