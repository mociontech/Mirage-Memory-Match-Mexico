import { useEffect, useState } from "react";
import { useFlow } from "../../app/FlowMachine";
import { BrandFrame } from "../../components/BrandFrame";
import { Footer } from "../../components/Footer";
import { Logo } from "../../components/Logo";
import { NotchedCard } from "../../components/NotchedCard";
import { getTop10, type RankingEntry } from "../../services/ranking";
import styles from "./Ranking.module.css";

const AUTO_ADVANCE_MS = 7_000;
const TOP_N = 5;

/**
 * Top 5. Closes the loop back to Welcome — after AUTO_ADVANCE_MS or on the
 * first tap, whichever comes first, so a kiosk session never dead-ends here
 * waiting on the much longer idle-reset timeout (60s, wired in App.tsx).
 * The list never blocks: getTop10() resolves to [] instead of hanging if the
 * backend is unreachable.
 *
 * Positioned to match Figma (node 423:290, 1080x1920) exactly — every
 * left/top/width/height/font-size is `(figma_px / 1920) * 100`cqh, same
 * conversion as every other screen (see the comment in Welcome.tsx for why
 * that's exact on this aspect-locked shell).
 */
export function Ranking() {
  const { reset } = useFlow();
  const [entries, setEntries] = useState<RankingEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    getTop10().then((result) => {
      if (!cancelled) setEntries(result.slice(0, TOP_N));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(reset, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [reset]);

  return (
    <div className={styles.shell} onClick={reset}>
      <BrandFrame />
      <div className={styles.logo}>
        <Logo />
      </div>
      <h1 className={styles.title}>¡Top 5!</h1>
      <NotchedCard className={styles.card}>
        {entries.length === 0 ? (
          <p className={styles.empty}>Aún no hay resultados para mostrar.</p>
        ) : (
          <ol className={styles.list}>
            {entries.map((entry, index) => (
              <li key={`${entry.name}-${index}`} className={styles.row}>
                <span>{entry.name}</span>{" "}
                <span className={styles.score}>{Math.round(entry.points)}pt</span>
              </li>
            ))}
          </ol>
        )}
      </NotchedCard>
      <Footer />
    </div>
  );
}
