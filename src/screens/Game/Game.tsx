import { useEffect, useState, type CSSProperties } from "react";
import { useFlow } from "../../app/FlowMachine";
import { useMemoryGame } from "../../game/useMemoryGame";
import { PRODUCTS } from "../../game/products";
import {
  CARD_DROP_DURATION_MS,
  CARD_DROP_STAGGER_MS,
  INTRO_REVEAL_DURATION_MS,
} from "../../game/game.config";
import { AttemptsBadge } from "../../components/AttemptsBadge";
import { BrandFrame } from "../../components/BrandFrame";
import { Footer } from "../../components/Footer";
import { ProductPopup } from "../../components/ProductPopup";
import { Logo } from "../../components/Logo";
import { Card } from "./Card";
import styles from "./Game.module.css";

/**
 * Pre-game intro: cards drop into place face-down, then flip face-up for a
 * beat so the player actually sees the board before it becomes a memory
 * test, then flip back down and hand off to real play. `dropping` and
 * `revealing` both hold cards face-up-ignoring-taps/face-down-blocking-taps
 * as appropriate; `playing` hands full control to useMemoryGame.
 */
type IntroStage = "dropping" | "revealing" | "playing";

/** Board screen: wires useMemoryGame to the UI, nothing here owns game rules. */
export function Game() {
  const { navigate, setSession } = useFlow();
  const [introStage, setIntroStage] = useState<IntroStage>("dropping");
  const {
    cards,
    phase,
    attempts,
    score,
    gridColumns,
    matchedProductIds,
    shakingIds,
    lastMatchedProduct,
    lastMatchPhrase,
    flipCard,
    acknowledgeMatch,
  } = useMemoryGame(introStage === "playing");

  // Intentionally run-once: useFlow() returns a fresh setSession on every
  // render, so including it here would re-stamp startedAt on every render.
  useEffect(() => {
    setSession({ startedAt: new Date().toISOString() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Runs once on mount: waits out the staggered drop animation, flips every
  // card face-up for a preview, then flips back down and starts real play
  // (and, via `introStage === "playing"` above, the countdown).
  useEffect(() => {
    const dropTotalMs = CARD_DROP_DURATION_MS + (cards.length - 1) * CARD_DROP_STAGGER_MS;
    const revealTimer = setTimeout(() => setIntroStage("revealing"), dropTotalMs);
    const playTimer = setTimeout(
      () => setIntroStage("playing"),
      dropTotalMs + INTRO_REVEAL_DURATION_MS,
    );
    return () => {
      clearTimeout(revealTimer);
      clearTimeout(playTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === "finished" && !lastMatchedProduct) {
      setSession({
        score,
        attempts,
        matchedProducts: matchedProductIds,
        finishedAt: new Date().toISOString(),
      });
      navigate("felicidades");
    }
  }, [phase, lastMatchedProduct, score, attempts, matchedProductIds, navigate, setSession]);

  const gridRows = Math.ceil(cards.length / gridColumns);

  return (
    <div className={styles.shell}>
      <BrandFrame />
      <div className={styles.logo}>
        <Logo />
      </div>
      {/* The countdown (timeRemainingMs) still runs inside useMemoryGame and still ends
          the game — the Figma board just never surfaces it, only the attempts count. */}
      <div className={styles.badgeBox}>
        <AttemptsBadge attempts={attempts} className={styles.attemptsBadge} />
      </div>
      <div className={styles.boardWrap}>
        <div
          className={styles.board}
          style={{ "--grid-columns": gridColumns, "--grid-rows": gridRows } as CSSProperties}
        >
          {cards.map((card, index) => (
            <Card
              key={card.id}
              isFlipped={introStage === "revealing" || card.isFlipped}
              isMatched={card.isMatched}
              product={PRODUCTS.find((p) => p.id === card.productId)}
              onTap={() => flipCard(card.id)}
              disabled={introStage !== "playing"}
              dropDelayMs={index * CARD_DROP_STAGGER_MS}
              seed={index}
              breathe={introStage === "playing" && !card.isFlipped && !card.isMatched}
              shaking={shakingIds.includes(card.id)}
            />
          ))}
        </div>
      </div>

      <ProductPopup
        open={lastMatchedProduct !== null}
        onClose={acknowledgeMatch}
        copy={lastMatchPhrase ?? ""}
      />
      <Footer />
    </div>
  );
}
