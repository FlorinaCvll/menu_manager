import { actualizarPlato, eliminarPlato } from "@/lib/platos-api";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  return actualizarPlato(request, Number(id));
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  return eliminarPlato(Number(id));
}
