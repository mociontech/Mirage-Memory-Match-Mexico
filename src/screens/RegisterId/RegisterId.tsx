import { useState } from "react";
import { useFlow } from "../../app/FlowMachine";
import { checkEmailUsedRemotely, hasEmailPlayedLocally, lookupRegistrationByCode, rememberUsedEmail } from "../../services/idService";
import { Button } from "../../components/Button";
import { IdInput, type IdInputValue } from "../../components/IdInput";
import { Modal } from "../../components/Modal";
import modalStyles from "../../components/Modal/Modal.module.css";
import iconWarning from "../../assets/images/icon-warning.svg";
import { ScreenShell } from "../ScreenShell";
import styles from "./RegisterId.module.css";

const EMPTY_ID: IdInputValue = ["", ""];

/**
 * Pantalla de reingreso rapido: busca el codigo contra el registro guardado
 * en Register.tsx (submitRegistration) y recupera nombre/correo desde ahi -
 * antes esto aceptaba cualquier codigo sin validarlo y seguia con la sesion
 * vacia, asi que la participacion final salia sin nombre/correo. "No
 * encontrado" y "ya participaste" son dos modales distintos porque son dos
 * problemas distintos para quien esta parado ahi con su codigo en la mano.
 */
export function RegisterId() {
  const { navigate, setSession } = useFlow();
  const [blocks, setBlocks] = useState<IdInputValue>(EMPTY_ID);
  const [checking, setChecking] = useState(false);
  const [showAdvertencia, setShowAdvertencia] = useState(false);
  const [showNoEncontrado, setShowNoEncontrado] = useState(false);

  const id = `${blocks[0]}-${blocks[1]}`;
  const canSubmit = blocks[0].length === 3 && blocks[1].length === 3 && !checking;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setChecking(true);
    const lookup = await lookupRegistrationByCode(id);
    if (lookup.status !== "found") {
      setChecking(false);
      setShowNoEncontrado(true);
      return;
    }

    const email = lookup.record.email?.trim();
    if (email && (hasEmailPlayedLocally(email) || (await checkEmailUsedRemotely(email)))) {
      setChecking(false);
      if (email) rememberUsedEmail(email);
      setShowAdvertencia(true);
      return;
    }

    setChecking(false);
    setSession({ id, name: lookup.record.name ?? "", email: email ?? "" });
    navigate("instructions");
  };

  return (
    <ScreenShell
      actions={
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {checking ? "Verificando..." : "Comenzar"}
        </Button>
      }
    >
      <h1 className={styles.title}>Agrega ID</h1>
      <IdInput value={blocks} onChange={setBlocks} />

      <Modal open={showAdvertencia} onClose={() => setShowAdvertencia(false)}>
        <img className={styles.warningIcon} src={iconWarning} alt="" aria-hidden="true" />
        <p className={modalStyles.text}>
          Parece que ya participaste en esta experiencia. ¡Gracias!
        </p>
      </Modal>

      <Modal open={showNoEncontrado} onClose={() => setShowNoEncontrado(false)}>
        <img className={styles.warningIcon} src={iconWarning} alt="" aria-hidden="true" />
        <p className={modalStyles.text}>
          No encontramos ese código. Verifica que esté bien escrito o regístrate de nuevo.
        </p>
      </Modal>
    </ScreenShell>
  );
}
