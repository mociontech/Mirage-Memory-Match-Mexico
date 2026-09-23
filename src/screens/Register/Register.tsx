import { useState } from "react";
import { useFlow } from "../../app/FlowMachine";
import { checkEmailUsedRemotely, generateId, hasEmailPlayedLocally, rememberUsedEmail } from "../../services/idService";
import { BrandFrame } from "../../components/BrandFrame";
import { Button } from "../../components/Button";
import { Footer } from "../../components/Footer";
import { Logo } from "../../components/Logo";
import { TextField } from "../../components/TextField";
import { Modal } from "../../components/Modal";
import modalStyles from "../../components/Modal/Modal.module.css";
import iconPerson from "../../assets/images/icon-person.svg";
import iconEnvelope from "../../assets/images/icon-envelope.svg";
import iconWarning from "../../assets/images/icon-warning.svg";
import styles from "./Register.module.css";

/**
 * Name + email capture, or a link into RegisterId to resume with an existing
 * ID. Positioned to match Figma (node 209:235, 1080x1920) exactly — every
 * left/top/width/height/font-size is `(figma_px / 1920) * 100`cqh, same
 * conversion as Welcome (see the comment there for why it's exact on this
 * aspect-locked shell). Bypasses ScreenShell's flex layout for the same
 * reason Welcome does: Figma's coordinates don't reduce to a centered column.
 *
 * hasEmailPlayedLocally solo atrapa un repetido en el MISMO navegador,
 * checkEmailUsedRemotely cierra la brecha de alguien que repite desde otro
 * celular con el mismo correo - antes eso pasaba de largo hasta Result,
 * donde el envio se rechazaba en silencio (el unique constraint de Supabase
 * ya protegia los datos, pero el participante nunca se enteraba de que no
 * conto). "checking" deshabilita el boton mientras corre el chequeo remoto
 * para que un doble tap no dispare dos registros.
 */
export function Register() {
  const { navigate, setSession } = useFlow();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showAdvertencia, setShowAdvertencia] = useState(false);
  const [checking, setChecking] = useState(false);

  const canSubmit = name.trim().length > 0 && email.trim().length > 0 && !checking;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const trimmedEmail = email.trim();

    if (hasEmailPlayedLocally(trimmedEmail)) {
      setShowAdvertencia(true);
      return;
    }

    setChecking(true);
    const usedRemotely = await checkEmailUsedRemotely(trimmedEmail);
    setChecking(false);
    if (usedRemotely) {
      rememberUsedEmail(trimmedEmail);
      setShowAdvertencia(true);
      return;
    }

    setSession({ name: name.trim(), email: trimmedEmail, id: generateId() });
    navigate("idGenerated");
  };

  const handleDigitaId = async () => {
    if (!canSubmit) return;
    const trimmedEmail = email.trim();

    if (hasEmailPlayedLocally(trimmedEmail)) {
      setShowAdvertencia(true);
      return;
    }

    setChecking(true);
    const usedRemotely = await checkEmailUsedRemotely(trimmedEmail);
    setChecking(false);
    if (usedRemotely) {
      rememberUsedEmail(trimmedEmail);
      setShowAdvertencia(true);
      return;
    }

    // RegisterId only collects the ID itself — name/email must already be in the
    // session before navigating there, or the final submit goes out with no email.
    setSession({ name: name.trim(), email: trimmedEmail });
    navigate("registerId");
  };

  return (
    <div className={styles.shell}>
      <BrandFrame />
      <div className={styles.logo}>
        <Logo />
      </div>
      <h1 className={styles.title}>REGISTRO</h1>

      <div className={`${styles.fieldBox} ${styles.nameField}`}>
        <TextField
          icon={<img src={iconPerson} alt="" />}
          iconClassName={styles.nameIcon}
          placeholder="Nombre"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className={`${styles.fieldBox} ${styles.emailField}`}>
        <TextField
          icon={<img src={iconEnvelope} alt="" />}
          iconClassName={styles.emailIcon}
          placeholder="Correo"
          type="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className={styles.buttonBox}>
        <Button className={styles.ctaButton} onClick={handleSubmit} disabled={!canSubmit}>
          {checking ? "Verificando..." : "Comenzar"}
        </Button>
      </div>
      <button className={styles.link} onClick={handleDigitaId} disabled={!canSubmit}>
        ó Digita ID
      </button>

      <Modal open={showAdvertencia} onClose={() => setShowAdvertencia(false)}>
        <img className={styles.warningIcon} src={iconWarning} alt="" aria-hidden="true" />
        <p className={modalStyles.text}>
          Parece que ya participaste en esta experiencia. ¡Gracias!
        </p>
      </Modal>

      <Footer />
    </div>
  );
}
