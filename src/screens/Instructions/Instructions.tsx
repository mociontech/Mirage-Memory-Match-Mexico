import { useFlow } from "../../app/FlowMachine";
import { BrandFrame } from "../../components/BrandFrame";
import { Button } from "../../components/Button";
import { Footer } from "../../components/Footer";
import { Logo } from "../../components/Logo";
import { PAIRS_COUNT } from "../../game/game.config";
import instructionsIcon from "../../assets/images/instructions-touch.webp";
import styles from "./Instructions.module.css";

/**
 * Explains the memory-match rules before the board loads. "Si completas las
 * N" reads off PAIRS_COUNT instead of a hardcoded number in the Figma copy —
 * that number was one of the Fase 0 inconsistencies, resolved to 8 pairs
 * (Colombia board, Figma node 209:862).
 *
 * Positioned to match Figma (node 209:366, 1080x1920) exactly — every
 * left/top/width/height/font-size is `(figma_px / 1920) * 100`vh, same
 * conversion as Welcome/Register/IdGenerated (see the comment in Welcome.tsx
 * for why that's exact on this aspect-locked shell).
 */
export function Instructions() {
  const { navigate } = useFlow();
  return (
    <div className={styles.shell}>
      <BrandFrame />
      <div className={styles.logo}>
        <Logo />
      </div>
      <img className={styles.icon} src={instructionsIcon} alt="" aria-hidden="true" />
      <h1 className={styles.title}>Instructivo</h1>
      <ol className={styles.list}>
        <li>
          Toca las tarjetas en el tablero para <strong>descubrir objetos.</strong>
        </li>
        <li>
          Por cada coincidencia correcta, <strong>desbloquearás un beneficio</strong> y sumarás
          puntos.
        </li>
        <li>
          Si completas las {PAIRS_COUNT}, <strong>podrás canjear tus puntos</strong> por premios y
          pasar a la siguiente experiencia.
        </li>
      </ol>
      <div className={styles.buttonBox}>
        <Button className={styles.ctaButton} onClick={() => navigate("game")}>
          Iniciar
        </Button>
      </div>
      <Footer />
    </div>
  );
}
