import { useEffect } from "react";
import { useFlow } from "../../app/FlowMachine";
import { BrandFrame } from "../../components/BrandFrame";
import { Footer } from "../../components/Footer";
import { NotchedCard } from "../../components/NotchedCard";
import { Logo } from "../../components/Logo";
import logoMark from "../../assets/images/logo-mark-red.svg";
import styles from "./Felicidades.module.css";

const AUTO_ADVANCE_MS = 2_500;

/**
 * Brand interstitial between finishing the board and seeing the score - no
 * button in Figma, so it auto-advances (same pattern as Ranking's dead end),
 * with a tap advancing early. Positioned to match Figma (node 123:2833,
 * 1080x1920) exactly — every left/top/width/height/font-size is
 * `(figma_px / 1920) * 100`vh, same conversion as every other screen (see
 * the comment in Welcome.tsx for why that's exact on this aspect-locked
 * shell). The card is a plain positioned background here; the title/
 * divider/tagline are separate siblings positioned in the same coordinate
 * space, painted on top by DOM order.
 */
export function Felicidades() {
  const { navigate } = useFlow();

  useEffect(() => {
    const timer = setTimeout(() => navigate("result"), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={styles.shell} onClick={() => navigate("result")}>
      <BrandFrame />
      <div className={styles.logo}>
        <Logo />
      </div>
      <NotchedCard className={styles.card} />
      <h1 className={styles.title}>¡Felicidades!</h1>
      <div className={styles.divider}>
        <span className={styles.line} />
        <img className={styles.mark} src={logoMark} alt="" aria-hidden="true" />
        <span className={styles.line} />
      </div>
      <p className={styles.tagline}>
        Acondicionamos tu vida<sup>®</sup>
      </p>
      <Footer />
    </div>
  );
}
