import { useState } from "react";
import type { Profile } from "../../offline/store";
import { putProfile } from "../../offline/store";
import { Audio } from "../../components/Audio";
export function Profiles({
  items,
  onSelect,
  onCreated,
}: {
  items: Profile[];
  onSelect: (p: Profile) => void;
  onCreated: () => Promise<void>;
}) {
  const [alias, setAlias] = useState("");
  const [grade, setGrade] = useState(2);
  const [avatar, setAvatar] = useState("🌻");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <section className="profiles">
      <div>
        <p className="eyebrow">Tu lugar para aprender</p>
        <h2>¡Hola! ¿Quién aprende hoy?</h2>
        <p>
          Usa un alias, como Sol o Semilla. Tus avances quedan en este equipo.
        </p>
        <Audio id="inicio" />
        <div className="profile-grid">
          {items.map((p) => (
            <button
              className="profile-tile"
              key={p.id}
              onClick={() => onSelect(p)}
            >
              <span>{p.avatar}</span>
              <strong>{p.alias}</strong>
              <small>{p.grade === 0 ? "Transición" : `Grado ${p.grade}`}</small>
            </button>
          ))}
        </div>
      </div>
      <form
        className="panel"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            const p: Profile = {
              id: crypto.randomUUID(),
              alias: alias.trim(),
              grade,
              avatar,
              group: "Villanueva",
              support: "guiado",
              assigned: false,
            };
            await putProfile(p);
            await onCreated();
            onSelect(p);
          } catch {
            setError(
              "No se pudo guardar el perfil. Revisa el almacenamiento del equipo.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <h3>Crear mi perfil</h3>
        <label>
          Mi alias
          <input
            required
            maxLength={30}
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            autoComplete="off"
          />
        </label>
        <label>
          Mi grado
          <select
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
          >
            <option value={0}>Transición</option>
            {[1, 2, 3, 4, 5].map((g) => (
              <option key={g} value={g}>
                Grado {g}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>Mi dibujo</legend>
          <div className="avatar-options">
            {["🌻", "🐢", "🦋", "🌱"].map((a) => (
              <button
                type="button"
                key={a}
                aria-label={`Avatar ${a}`}
                aria-pressed={avatar === a}
                onClick={() => setAvatar(a)}
              >
                {a}
              </button>
            ))}
          </div>
        </fieldset>
        <button disabled={!alias.trim() || busy} className="primary">
          Crear perfil →
        </button>
        {error && <p role="alert">{error}</p>}
      </form>
    </section>
  );
}
