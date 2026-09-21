import { useEffect, useState, type CSSProperties } from "react";
import logoMark from "../../assets/images/logo-mark.svg";
import type { CardRect, Product } from "../../game/products";
import styles from "./Card.module.css";

/** Converts a product's logoRect/photoRect (% of the card box) into inline positioning. */
function rectStyle(rect: CardRect): CSSProperties {
  return {
    left: `${rect.left}%`,
    top: `${rect.top}%`,
    width: `${rect.width}%`,
    height: `${rect.height}%`,
  };
}

interface CardProps {
  isFlipped: boolean;
  isMatched: boolean;
  product: Product | undefined;
  onTap: () => void;
  /** Stagger for the intro drop-in animation; 0 outside the intro (mount only, never replayed). */
  dropDelayMs?: number;
  /** True while the intro preview is holding every card face-up — taps are ignored until it ends. */
  disabled?: boolean;
  /** Stable per-card index, used only to pick a pseudo-random breathing delay/duration (so cards don't breathe in lockstep). */
  seed?: number;
  /** True while idle face-down and waiting to be tapped — gives the board a bit of life between taps. */
  breathe?: boolean;
  /** True for the ~400ms right after a wrong guess, before the pair flips back down. */
  shaking?: boolean;
}

/** Deterministic 0..1 pseudo-random from an integer seed — same seed always breathes the same way, no state needed. */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** One board tile: flips with transform/backface-visibility only (no layout-affecting animation). */
export function Card({
  isFlipped,
  isMatched,
  product,
  onTap,
  dropDelayMs = 0,
  disabled = false,
  seed = 0,
  breathe = false,
  shaking = false,
}: CardProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
  }, [isFlipped]);

  const breatheDelayMs = Math.round(pseudoRandom(seed) * 2500);
  const breatheDurationMs = 3000 + Math.round(pseudoRandom(seed + 0.5) * 1800);

  return (
    <button
      type="button"
      className={`${styles.outer} ${breathe ? styles.breathing : ""} ${shaking ? styles.shaking : ""}`}
      style={
        {
          "--drop-delay": `${dropDelayMs}ms`,
          "--breathe-delay": `${breatheDelayMs}ms`,
          "--breathe-duration": `${breatheDurationMs}ms`,
        } as CSSProperties
      }
      onClick={onTap}
      disabled={disabled || isFlipped || isMatched}
      aria-label={isFlipped || isMatched ? (product?.name ?? "carta") : "Carta boca abajo"}
    >
      <div
        className={`${styles.inner} ${isFlipped || isMatched ? styles.flipped : ""} ${isMatched ? styles.matched : ""}`}
        data-animating={isAnimating}
        onTransitionEnd={() => setIsAnimating(false)}
      >
        <div className={`${styles.face} ${styles.faceDown}`}>
          <img className={styles.faceDownIcon} src={logoMark} alt="" aria-hidden="true" />
        </div>
        <div className={`${styles.face} ${styles.faceUp}`}>
          {product && (
            <>
              <img
                className={styles.productLogo}
                style={rectStyle(product.logoRect)}
                src={product.logo}
                alt={product.name}
              />
              <img
                className={styles.productImage}
                style={rectStyle(product.photoRect)}
                src={product.image}
                alt=""
                aria-hidden="true"
              />
            </>
          )}
        </div>
      </div>
    </button>
  );
}
