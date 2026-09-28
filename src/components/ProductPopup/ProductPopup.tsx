import { useEffect } from "react";
import logoMark from "../../assets/images/logo-mark.svg";
import { Modal } from "../Modal";
import modalStyles from "../Modal/Modal.module.css";
import styles from "./ProductPopup.module.css";

const AUTO_CLOSE_MS = 2_500;

interface ProductPopupProps {
  open: boolean;
  onClose: () => void;
  copy: string;
}

/**
 * Shown after each successful match: darkens the board and reveals the
 * product's copy. Se cierra solo a los AUTO_CLOSE_MS sin necesidad de tocar
 * de nuevo - antes solo cerraba con un tap explicito.
 */
export function ProductPopup({ open, onClose, copy }: ProductPopupProps) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, AUTO_CLOSE_MS);
    return () => clearTimeout(timer);
  }, [open, onClose]);

  return (
    <Modal open={open} onClose={onClose}>
      <img className={styles.mark} src={logoMark} alt="" aria-hidden="true" />
      <p className={modalStyles.text}>{copy}</p>
    </Modal>
  );
}
