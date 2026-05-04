import { listarPlatos, crearPlato } from "@/lib/platos-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return listarPlatos(searchParams.get("tipo"));
}

export async function POST(request: Request) {
  return crearPlato(request);
}
