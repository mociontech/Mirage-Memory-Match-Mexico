import { useEffect, useRef, useState } from "react";
import { useFlow } from "../../app/FlowMachine";
import { BrandFrame } from "../../components/BrandFrame";
import { Footer } from "../../components/Footer";
import { Logo } from "../../components/Logo";
import { rememberUsedEmail, rememberUsedId } from "../../services/idService";
import { enqueueParticipation } from "../../services/outbox";
import { getMyPosition } from "../../services/ranking";
import type { Participation } from "../../types/participation";
import styles from "./Result.module.css";

const AUTO_ADVANCE_MS = 7_000;
/** Position poll attempts, spaced out to give the outbox (1s/2s/4s/8s backoff) time to actually land the row before AUTO_ADVANCE_MS fires. */
const POSITION_POLL_DELAYS_MS = [1_500, 3_500, 6_000];

/**
 * Thank-you + accumulated points. Writes the outbox entry once, on arrival.
 * No button in Figma - the whole card advances to Ranking, on tap or after
 * AUTO_ADVANCE_MS, same dead-end pattern as Ranking itself. Positioned to
 * match Figma (node 209:763, 1080x1920) exactly — every
 * left/top/width/height/font-size is `(figma_px / 1920) * 100`cqh, same
 * conversion as every other screen (see the comment in Welcome.tsx for why
 * that's exact on this aspect-locked shell).
 *
 * The ranking position line under "Acumulaste" is not in Figma - added on
 * request, deliberately subtle (small, muted) so it doesn't compete with
 * the actual design. It only ever appears once the submission has actually
 * synced; a kiosk offline or a slow sync just shows nothing, never a wrong
 * or stale number.
 */
export function Result() {
  const { navigate, session } = useFlow();
  const submitted = useRef(false);
  const [position, setPosition] = useState<number | null>(null);

  useEffect(() => {
    if (submitted.current) return;
    submitted.current = true;

    rememberUsedId(session.id);
    if (session.email) rememberUsedEmail(session.email);

    const participation: Participation = {
      id: session.id,
      name: session.name,
      email: session.email,
      points: session.score,
      attempts: session.attempts,
      matchedProducts: session.matchedProducts,
      startedAt: session.startedAt,
      finishedAt: session.finishedAt,
      kioskId: import.meta.env.VITE_KIOSK_ID,
    };
    enqueueParticipation(participation);
  }, [session]);

  useEffect(() => {
    if (!session.email) return;
    let cancelled = false;
    const timers = POSITION_POLL_DELAYS_MS.map((delay) =>
      setTimeout(() => {
        if (cancelled) return;
        getMyPosition(session.email!).then((result) => {
          if (!cancelled && result !== null) setPosition(result);
        });
      }, delay),
    );
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [session.email]);

  useEffect(() => {
    const timer = setTimeout(() => navigate("ranking"), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={styles.shell} onClick={() => navigate("ranking")}>
      <BrandFrame />
      <div className={`${styles.logo} enterFromTop`}>
        <Logo />
      </div>
      <h1 className={`${styles.title} enterFromLeft delay1`}>¡Gracias por participar!</h1>
      <div className={`${styles.scoreBox} enterScale delay2`}>{Math.round(session.score)}</div>
      <p className={`${styles.label} enterFade delay3`}>Acumulaste</p>
      {position !== null && (
        <p className={`${styles.position} enterFade delay4`}>Vas en el puesto #{position}</p>
      )}
      <Footer />
    </div>
  );
}
