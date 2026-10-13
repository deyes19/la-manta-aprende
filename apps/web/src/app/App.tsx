import { migrateProgress } from "../offline/migrate";
import { useEffect, useState } from "react";
import {
  profiles,
  allProgress,
  loadProgress,
  newProgress,
  saveProgress,
  type Profile,
  type Progress,
} from "../offline/store";
import { Profiles } from "../features/student/Profiles";
import { Route } from "../features/student/Route";
import { Player } from "../features/lessons/Player";
import { Dashboard } from "../features/teacher/Dashboard";
import { Settings } from "../features/accessibility/Settings";
import { Readiness } from "../offline/Readiness";
import { findUnit, type Unit } from "../data/content";
export function App() {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [items, setItems] = useState<Profile[]>([]);
  const [records, setRecords] = useState<Progress[]>([]);
  const [selected, setSelected] = useState<Profile>();
  const [playing, setPlaying] = useState<Progress>();
  const [teacher, setTeacher] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [large, setLarge] = useState(false);
  const [contrast, setContrast] = useState(false);
  useEffect(() => {
    const ready = () => setHasUpdate(true);
    window.addEventListener("manta-update", ready);
    return () => window.removeEventListener("manta-update", ready);
  }, []);
  async function refresh() {
    const [p, r] = await Promise.all([profiles(), allProgress()]);
    setItems(p);
    setSelected((current) => p.find((item) => item.id === current?.id));
    setRecords(r);
  }
  useEffect(() => {
    refresh()
      .then(() => setLoaded(true))
      .catch(() => {
        setLoaded(true);
        setError(
          "No se pudo abrir el almacenamiento local. Usa un navegador compatible y permite guardar datos.",
        );
      });
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("large-text", large);
    document.documentElement.classList.toggle("high-contrast", contrast);
  }, [large, contrast]);
  async function start(unit: Unit) {
    try {
      const p = await loadProgress(selected!.id, unit.id);
      if (p && p.version !== unit.version) {
        const updated = migrateProgress(p, unit);
        if (!updated) {
          setError(
            "Tu avance corresponde a otra versión sin una actualización compatible. Exporta el reporte docente; no se sobrescribió.",
          );
          return;
        }
        await saveProgress(updated);
        setPlaying(updated);
        return;
      }
      setPlaying(p ?? newProgress(selected!.id, unit.id, unit.version));
    } catch {
      setError("No se pudo recuperar el avance. Revisa el almacenamiento.");
    }
  }
  return (
    <>
      <a className="skip" href="#contenido">
        Saltar al contenido
      </a>
      <header>
        <a className="brand" href="#contenido" aria-label="La Manta Aprende">
          <img src="/icon.svg" alt="" />
          <span>
            La Manta <strong>Aprende</strong>
            <small>I. E. La Manta · Sede Villanueva</small>
          </span>
        </a>
        <nav aria-label="Modo de trabajo">
          <button
            aria-pressed={!teacher}
            onClick={() => {
              setTeacher(false);
              setPlaying(undefined);
              void refresh().catch(() =>
                setError("No se pudo actualizar el avance."),
              );
            }}
          >
            🌱 Estudiantes
          </button>
          <button
            aria-pressed={teacher}
            onClick={() => {
              setTeacher(true);
              setPlaying(undefined);
              void refresh().catch(() =>
                setError("No se pudo actualizar el reporte."),
              );
            }}
          >
            📋 Docente
          </button>
        </nav>
      </header>
      <main id="contenido">
        <Settings
          large={large}
          contrast={contrast}
          onLarge={() => setLarge(!large)}
          onContrast={() => setContrast(!contrast)}
        />
        <Readiness />
        {hasUpdate && (
          <div className="warning" role="status">
            <p>
              Hay una actualización. Termina la actividad y exporta tus
              resultados antes de aplicarla.
            </p>
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("manta-apply-update"))
              }
            >
              Aplicar actualización y recargar
            </button>
          </div>
        )}
        {error && (
          <div role="alert" className="error">
            {error}
            <button
              onClick={() => {
                setError("");
                void refresh().catch(() =>
                  setError("El almacenamiento sigue sin estar disponible."),
                );
              }}
            >
              Reintentar
            </button>
          </div>
        )}
        {!loaded ? (
          <p role="status">Abriendo tu escuela…</p>
        ) : teacher ? (
          <Dashboard profiles={items} progress={records} refresh={refresh} />
        ) : playing && selected && findUnit(playing.unitId) ? (
          <Player
            key={selected.id + playing.unitId}
            profile={selected}
            unit={findUnit(playing.unitId)!}
            initial={playing}
            onExit={() => {
              setPlaying(undefined);
              void refresh().catch(() =>
                setError("No se pudo actualizar el avance."),
              );
            }}
          />
        ) : selected ? (
          <Route
            profile={selected}
            progress={records.filter((r) => r.profileId === selected.id)}
            onStart={(unit) => void start(unit)}
            onChange={() => setSelected(undefined)}
          />
        ) : (
          <Profiles items={items} onSelect={setSelected} onCreated={refresh} />
        )}
      </main>
      <footer>
        Hecho para aprender a nuestro ritmo · Montería, Córdoba
        <br />
        <span>
          Datos en este equipo. Piloto sujeto a validación curricular y
          pedagógica.
        </span>
      </footer>
    </>
  );
}
