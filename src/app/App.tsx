import { useEffect } from "react";
import { FlowProvider, useFlow } from "./FlowMachine";
import { useIdleReset } from "../hooks/useIdleReset";
import { initOutboxFlush } from "../services/outbox";
import { Welcome } from "../screens/Welcome";
import { Register } from "../screens/Register";
import { RegisterId } from "../screens/RegisterId";
import { IdGenerated } from "../screens/IdGenerated";
import { Instructions } from "../screens/Instructions";
import { Game } from "../screens/Game";
import { Felicidades } from "../screens/Felicidades";
import { Result } from "../screens/Result";
import { Ranking } from "../screens/Ranking";
import styles from "./App.module.css";

/**
 * Blocks the two gestures CSS alone can't stop on a public kiosk: the
 * right-click/long-press context menu and pinch-to-zoom (Safari's
 * non-standard `gesturestart` plus a synthetic pinch via multi-touch).
 */
function useKioskGestureLock(): void {
  useEffect(() => {
    const blockContextMenu = (event: Event) => event.preventDefault();
    const blockGesture = (event: Event) => event.preventDefault();
    const blockPinch = (event: TouchEvent) => {
      if (event.touches.length > 1) event.preventDefault();
    };

    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("gesturestart", blockGesture);
    document.addEventListener("touchmove", blockPinch, { passive: false });

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("gesturestart", blockGesture);
      document.removeEventListener("touchmove", blockPinch);
    };
  }, []);
}

function CurrentScreen() {
  const { screen } = useFlow();
  switch (screen) {
    case "welcome":
      return <Welcome />;
    case "register":
      return <Register />;
    case "registerId":
      return <RegisterId />;
    case "idGenerated":
      return <IdGenerated />;
    case "instructions":
      return <Instructions />;
    case "game":
      return <Game />;
    case "felicidades":
      return <Felicidades />;
    case "result":
      return <Result />;
    case "ranking":
      return <Ranking />;
  }
}

function AppShell() {
  const { reset } = useFlow();
  useIdleReset(reset);
  useKioskGestureLock();
  useEffect(() => initOutboxFlush(), []);

  return (
    <div className={styles.shell}>
      <CurrentScreen />
    </div>
  );
}

/** App root: wires the flow state machine and kiosk hardening. */
export function App() {
  return (
    <FlowProvider>
      <AppShell />
    </FlowProvider>
  );
}
