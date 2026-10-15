import { env } from "../config/env";

const TIME_ZONE = env.country === "CO" ? "America/Bogota" : "America/Mexico_City";

/**
 * `new Date().toISOString()` da hora UTC con sufijo "Z" - correcta como
 * dato, pero Evius la muestra tal cual sin convertirla a la hora local del
 * evento, asi que un registro de las 8pm en Mexico (UTC-6) aparecia como
 * las 02:00 del dia siguiente en su dashboard. Esta version arma el mismo
 * formato ISO pero con la hora YA en la zona del pais y su offset explicito
 * (ej. "2026-10-14T20:03:15-06:00") en vez de "Z", para que se vea correcta
 * aunque quien la lea no haga ninguna conversion de zona horaria.
 */
export function nowLocalIso(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  const datePart = `${get("year")}-${get("month")}-${get("day")}`;
  const timePart = `${get("hour")}:${get("minute")}:${get("second")}`;

  // Offset real de esa zona en ese instante (cambia con horario de verano si
  // aplica) - se calcula comparando la hora local formateada contra UTC, no
  // se hardcodea "-06:00".
  const offsetMinutes = Math.round(
    (new Date(`${datePart}T${timePart}Z`).getTime() - now.getTime()) / 60000,
  );
  const sign = offsetMinutes < 0 ? "-" : "+";
  const abs = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(abs / 60)).padStart(2, "0");
  const offsetMins = String(abs % 60).padStart(2, "0");

  return `${datePart}T${timePart}.${String(now.getMilliseconds()).padStart(3, "0")}${sign}${offsetHours}:${offsetMins}`;
}
