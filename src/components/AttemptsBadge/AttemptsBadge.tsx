import { Badge } from "../Badge";

interface AttemptsBadgeProps {
  attempts: number;
  className?: string;
}

/** "Intentos: N" pill shown during the game. */
export function AttemptsBadge({ attempts, className }: AttemptsBadgeProps) {
  return <Badge className={className}>Intentos: {attempts}</Badge>;
}
