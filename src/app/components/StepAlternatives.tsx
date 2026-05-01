"use client";

import { useState, KeyboardEvent } from "react";
import type { AppState } from "../page";

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onBack: () => void;
  onNext: () => void;
}

export default function StepAlternatives({
  state,
  setState,
  onBack,
  onNext,
}: Props) {
  const [nameInput, setNameInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const addAlternative = () => {
    const name = nameInput.trim();
    if (!name) return;
    if (state.alternatives.some((a) => a.name === name)) {
      setError(`"${name}" existe déjà.`);
      return;
    }
    const scores: Record<string, number> = {};
    state.criteria.forEach((c) => {
      scores[c] = 0;
    });
    setState((s) => ({
      ...s,
      alternatives: [...s.alternatives, { name, scores }],
    }));
    setNameInput("");
    setError(null);
  };

  const removeAlternative = (name: string) => {
    setState((s) => ({
      ...s,
      alternatives: s.alternatives.filter((a) => a.name !== name),
    }));
  };

  const updateScore = (altName: string, criterion: string, value: string) => {
    const num = parseFloat(value);
    setState((s) => ({
      ...s,
      alternatives: s.alternatives.map((a) =>
        a.name === altName
          ? { ...a, scores: { ...a.scores, [criterion]: isNaN(num) ? 0 : num } }
          : a,
      ),
    }));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addAlternative();
    }
  };

  const allScoresFilled = state.alternatives.every((alt) =>
    state.criteria.every(
      (c) => alt.scores[c] !== undefined && alt.scores[c] >= 0,
    ),
  );
  const canProceed = state.alternatives.length >= 2 && allScoresFilled;

  return (
    <div className="card">
      <div className="card-title">
        <span className="step-badge">2</span>
        Définir les alternatives &amp; les scores
      </div>

      <p style={{ marginBottom: 20, fontSize: "0.9rem" }}>
        Pour chaque alternative, saisissez un score numérique pour chaque
        critère. Les scores sont{" "}
        <strong>relatifs au sein de chaque critère</strong> — utilisez
        n&apos;importe quelle échelle cohérente (ex. 1–10, prix réels, notes…).
      </p>

      {/* Ajouter une alternative */}
      <div>
        <label htmlFor="alt-input">Ajouter une alternative</label>
        <div className="row" style={{ alignItems: "flex-end" }}>
          <input
            id="alt-input"
            type="text"
            placeholder="ex. MacBook Pro, Dell XPS, ThinkPad…"
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
          />
          <button
            className="btn btn-secondary"
            style={{ flexShrink: 0, whiteSpace: "nowrap" }}
            onClick={addAlternative}
            disabled={!nameInput.trim()}>
            + Ajouter
          </button>
        </div>
        {error && (
          <p
            style={{
              marginTop: 6,
              fontSize: "0.82rem",
              color: "var(--error)",
            }}>
            {error}
          </p>
        )}
        <p className="hint">Il faut au minimum 2 alternatives.</p>
      </div>

      {/* Tableau des scores */}
      {state.alternatives.length > 0 && (
        <div className="section-gap">
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.88rem",
              }}>
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      borderBottom: "2px solid var(--border)",
                      color: "var(--ink-muted)",
                      fontSize: "0.78rem",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}>
                    Alternative
                  </th>
                  {state.criteria.map((c) => (
                    <th
                      key={c}
                      style={{
                        textAlign: "center",
                        padding: "8px 8px",
                        borderBottom: "2px solid var(--border)",
                        color: "var(--ink-muted)",
                        fontSize: "0.78rem",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                      }}>
                      {c}
                    </th>
                  ))}
                  <th style={{ width: 60 }} />
                </tr>
              </thead>
              <tbody>
                {state.alternatives.map((alt, idx) => (
                  <tr
                    key={alt.name}
                    style={{
                      background: idx % 2 === 0 ? "#fff" : "var(--paper)",
                    }}>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontWeight: 500,
                        borderBottom: "1px solid var(--border)",
                      }}>
                      {alt.name}
                    </td>
                    {state.criteria.map((c) => (
                      <td
                        key={c}
                        style={{
                          padding: "6px 8px",
                          borderBottom: "1px solid var(--border)",
                          textAlign: "center",
                        }}>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={alt.scores[c] ?? ""}
                          onChange={(e) =>
                            updateScore(alt.name, c, e.target.value)
                          }
                          style={{
                            width: 80,
                            textAlign: "center",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius)",
                            padding: "6px 4px",
                            fontFamily: "var(--mono)",
                            fontSize: "0.88rem",
                            background: "var(--paper)",
                          }}
                          placeholder="0"
                        />
                      </td>
                    ))}
                    <td
                      style={{
                        padding: "6px 8px",
                        borderBottom: "1px solid var(--border)",
                        textAlign: "center",
                      }}>
                      <button
                        className="btn btn-danger"
                        onClick={() => removeAlternative(alt.name)}>
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="hint" style={{ marginTop: 10 }}>
            Les scores sont normalisés par critère — seules leurs valeurs
            relatives importent. Pour les critères où une valeur élevée est
            préférable (performance), utilisez des valeurs plus grandes pour les
            meilleures options. Pour les coûts (prix), saisissez directement les
            montants réels — l&apos;AHP les normalise automatiquement.
          </p>
        </div>
      )}

      <div
        style={{
          marginTop: 28,
          display: "flex",
          justifyContent: "space-between",
        }}>
        <button className="btn btn-secondary" onClick={onBack}>
          ← Retour
        </button>
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={!canProceed}>
          Suivant : Matrice de comparaison →
        </button>
      </div>
    </div>
  );
}
