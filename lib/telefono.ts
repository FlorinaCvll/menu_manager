export function limpiarTelefono(valor: string) {
  return valor.replace(/[^\d +()-]/g, "");
}
