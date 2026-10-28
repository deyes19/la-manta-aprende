import { audioFile } from "../data/audio";
import { useEffect, useState } from "react";
import { units } from "../data/content";
export async function checkOffline() {
  if (import.meta.env.VITE_MANTA_DISTRIBUTION === "android") return true;
  if (!("serviceWorker" in navigator) || !("caches" in window)) return false;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration?.active) return false;
  const ids = [
    "inicio",
    "ruta",
    "autoevaluacion",
    "guardado",
    ...units
      .flatMap((unit) => unit.steps)
      .flatMap((s) => [
        s.id,
        s.id + "-hint",
        ...(s.activity ? [s.id + "-success", s.id + "-retry"] : []),
      ]),
  ];
  const results = await Promise.all(
    [...new Set(ids.map(audioFile))].map((url) =>
      caches.match(url, { ignoreSearch: true }),
    ),
  );
  return (
    results.every(Boolean) &&
    !!(await caches.match("/index.html", { ignoreSearch: true }))
  );
}
export function Readiness() {
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [message, setMessage] = useState("Preparando recursos locales…");
  async function check() {
    try {
      const ok = await checkOffline();
      setReady(ok);
      setMessage(
        ok
          ? import.meta.env.VITE_MANTA_DISTRIBUTION === "android"
            ? "Lecciones, imágenes y audios incluidos. Puedes aprender sin internet."
            : "Unidad y audios preparados para usar sin internet."
          : "Todavía no está preparada. En producción, espera la descarga y pulsa Verificar; no desconectes aún.",
      );
    } catch {
      setReady(false);
      setMessage(
        "No se pudo verificar la caché. Revisa el almacenamiento y vuelve a intentar.",
      );
    }
  }
  useEffect(() => {
    void check();
    const timer = setInterval(() => void check(), 4000);
    const online = () => setOnline(navigator.onLine);
    window.addEventListener("online", online);
    window.addEventListener("offline", online);
    return () => {
      clearInterval(timer);
      window.removeEventListener("online", online);
      window.removeEventListener("offline", online);
    };
  }, []);
  return (
    <div className={"offline-status " + (ready ? "ready" : "")}>
      <span aria-hidden="true">{ready ? "●" : "◌"}</span>
      <span role="status">
        {message} {!online && "Red desconectada."}
      </span>
      <button onClick={() => void check()}>Verificar</button>
    </div>
  );
}
