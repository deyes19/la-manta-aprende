import React, { Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { App } from "./app/App";
import "./styles.css";
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <main>
        <h1>No pudimos abrir la unidad</h1>
        <p>
          Los datos siguen en este equipo. Recarga la aplicación. Si continúa,
          pide al docente que revise la instalación y la versión del contenido.
        </p>
        <button onClick={() => location.reload()}>Recargar</button>
      </main>
    ) : (
      this.props.children
    );
  }
}
const updateSW = registerSW({
  onNeedRefresh() {
    const event = new CustomEvent("manta-update");
    window.dispatchEvent(event);
  },
  onRegisterError() {
    console.warn("No se registró el modo sin conexión.");
  },
});
window.addEventListener("manta-apply-update", () => void updateSW(true));
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
