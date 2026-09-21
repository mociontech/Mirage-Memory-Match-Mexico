import { useFlow } from "../../app/FlowMachine";
import { BrandFrame } from "../../components/BrandFrame";
import { Button } from "../../components/Button";
import { Footer } from "../../components/Footer";
import { IdInput, type IdInputValue } from "../../components/IdInput";
import { Logo } from "../../components/Logo";
import styles from "./IdGenerated.module.css";

/**
 * Shows the newly generated participation ID before entering the
 * instructions. Positioned to match Figma (node 209:298, 1080x1920) exactly
 * — every left/top/width/height/font-size is `(figma_px / 1920) * 100`vh,
 * same conversion as Welcome/Register (see the comment in Welcome.tsx for
 * why that's exact on this aspect-locked shell).
 */
export function IdGenerated() {
  const { navigate, session } = useFlow();
  const [first = "", second = ""] = session.id.split("-");
  const blocks: IdInputValue = [first, second];

  return (
    <div className={styles.shell}>
      <BrandFrame />
      <div className={styles.logo}>
        <Logo />
      </div>
      <h1 className={styles.title}>Tu ID único</h1>
      <p className={styles.description}>
        <span className={styles.descriptionBold}>Este es tu código personal.</span>
        <span>Guárdalo, lo necesitarás para iniciar.</span>
      </p>
      <div className={styles.idInputBox}>
        <IdInput value={blocks} onChange={() => {}} readOnly />
      </div>
      <div className={styles.buttonBox}>
        <Button className={styles.ctaButton} onClick={() => navigate("instructions")}>
          Comenzar
        </Button>
      </div>
      <Footer />
    </div>
  );
}
