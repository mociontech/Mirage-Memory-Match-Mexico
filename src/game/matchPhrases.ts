/**
 * Frases celebratorias mostradas en el popup al encontrar un par - copy
 * final del cliente (reemplaza los placeholders "Copy pendiente del
 * cliente para X" que tenia cada producto en products.ts#popupCopy). No
 * son especificas de ningun producto: se elige una al azar en cada match,
 * la misma lista para cualquier producto que se acierte.
 */
export const MATCH_PHRASES: string[] = [
  "¡Genial!",
  "¡Perfecto!",
  "¡Crack!",
  "¡Excelente!",
  "¡Lo lograste!",
  "¡Te luciste!",
  "¡Qué nivel!",
  "¡Vas con todo!",
  "¡Imparable!",
  "¡Eres una leyenda!",
  "¡Nivel desbloqueado!",
  "¡Reto superado!",
  "¡Punto extra!",
  "¡Premio desbloqueado!",
  "¡Épico!",
  "¡Increíble!",
  "¡Brillante!",
  "¡Fantástico!",
  "¡Espectacular!",
  "¡Impresionante!",
  "¡Vas muy bien!",
  "¡Sigue así!",
  "¡No pares!",
  "¡Tú puedes!",
  "¡Lo estás logrando!",
  "¡Cada vez mejor!",
  "¡Vas por buen camino!",
  "¡Ya casi!",
  "¡Estás imparable!",
];

export function pickRandomMatchPhrase(): string {
  return MATCH_PHRASES[Math.floor(Math.random() * MATCH_PHRASES.length)]!;
}
