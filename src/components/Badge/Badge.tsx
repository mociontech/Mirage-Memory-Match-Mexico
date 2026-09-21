import type { ReactNode } from "react";
import styles from "./Badge.module.css";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

/** The small red pill used for the attempts counter and, in Game, the time remaining. */
export function Badge({ children, className }: BadgeProps) {
  return <div className={className ? `${styles.badge} ${className}` : styles.badge}>{children}</div>;
}
