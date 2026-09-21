import logoMark from "../../assets/images/logo-mark.svg";
import { Modal } from "../Modal";
import modalStyles from "../Modal/Modal.module.css";
import styles from "./ProductPopup.module.css";

interface ProductPopupProps {
  open: boolean;
  onClose: () => void;
  copy: string;
}

/** Shown after each successful match: darkens the board and reveals the product's copy. */
export function ProductPopup({ open, onClose, copy }: ProductPopupProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <img className={styles.mark} src={logoMark} alt="" aria-hidden="true" />
      <p className={modalStyles.text}>{copy}</p>
    </Modal>
  );
}
