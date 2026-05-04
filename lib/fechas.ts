const TIME_ZONE = "Europe/Madrid";

function obtenerPartes(fecha: Date) {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(fecha);

  const year = Number(partes.find((parte) => parte.type === "year")?.value);
  const month = Number(partes.find((parte) => parte.type === "month")?.value);
  const day = Number(partes.find((parte) => parte.type === "day")?.value);

  return { year, month, day };
}

export function obtenerFechaSolo(fecha = new Date()) {
  const { year, month, day } = obtenerPartes(fecha);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function fechaDesdeInput(valor: string) {
  const [year, month, day] = valor.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function fechaAInput(fecha: string | Date) {
  const valor = new Date(fecha);
  const { year, month, day } = obtenerPartes(valor);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}

export function inicioDelDia(fecha = new Date()) {
  const inicio = new Date(fecha);
  inicio.setHours(0, 0, 0, 0);
  return inicio;
}

export function formatearFecha(fecha: string | Date) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeZone: TIME_ZONE,
  }).format(new Date(fecha));
}

export function formatearFechaHora(fecha: string | Date) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: TIME_ZONE,
  }).format(new Date(fecha));
}
