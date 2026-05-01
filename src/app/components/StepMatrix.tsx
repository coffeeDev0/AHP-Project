"use client";

import { useState, useEffect, useCallback } from "react";
import type { AppState } from "../page";

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onBack: () => void;
  onCompute: (matrix: number[][]) => void;
  loading: boolean;
}

const SAATY_OPTIONS = [
  { value: 9, label: "9 — Importance extrême" },
  { value: 8, label: "8 — Très très forte" },
  { value: 7, label: "7 — Très forte" },
  { value: 6, label: "6 — Forte+" },
  { value: 5, label: "5 — Forte" },
  { value: 4, label: "4 — Modérée+" },
  { value: 3, label: "3 — Modérée" },
  { value: 2, label: "2 — Légère" },
  { value: 1, label: "1 — Égale" },
  { value: 1 / 2, label: "1/2" },
  { value: 1 / 3, label: "1/3" },
  { value: 1 / 4, label: "1/4" },
  { value: 1 / 5, label: "1/5" },
  { value: 1 / 6, label: "1/6" },
  { value: 1 / 7, label: "1/7" },
  { value: 1 / 8, label: "1/8" },
  { value: 1 / 9, label: "1/9 — Inverse extrême" },
];

function makeIdentity(n: number): number[][] {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  );
}

export default function StepMatrix({
  state,
  onBack,
  onCompute,
  loading,
}: Props) {
  const n = state.criteria.length;
  const [matrix, setMatrix] = useState<number[][]>(() => makeIdentity(n));
  const [inputMode, setInputMode] = useState<"select" | "number">("select");

  useEffect(() => {
    setMatrix(makeIdentity(n));
  }, [n]);

  const setValue = useCallback((i: number, j: number, val: number) => {
    if (i === j) return;
    setMatrix((prev) => {
      const next = prev.map((row) => [...row]);
      next[i][j] = val;
      next[j][i] = val === 0 ? 0 : 1 / val;
      return next;
    });
  }, []);

  const handleNumberInput = (i: number, j: number, raw: string) => {
    const num = parseFloat(raw);
    if (!isNaN(num) && num > 0) setValue(i, j, num);
  };

  const handleSelectChange = (i: number, j: number, raw: string) => {
    const num = parseFloat(raw);
    if (!isNaN(num) && num > 0) setValue(i, j, num);
  };

  const formatVal = (v: number): string => {
    if (v === 0) return "—";
    if (v >= 1) return v === Math.floor(v) ? String(v) : v.toFixed(2);
    const inv = Math.round(1 / v);
    return `1/${inv}`;
  };

  const isReady = matrix.every((row) => row.every((v) => v > 0));

  return (
    <div className="card">
      <div className="card-title">
        <span className="step-badge">3</span>
        Matrice de comparaison par paires
      </div>

      <p style={{ marginBottom: 8, fontSize: "0.9rem" }}>
        Pour chaque paire de critères, indiquez{" "}
        <strong>combien de fois le critère en ligne est plus important</strong>{" "}
        que le critère en colonne, selon l&apos;échelle de Saaty (1–9). Les
        valeurs réciproques (triangle inférieur) sont remplies automatiquement.
      </p>

      {/* Légende de l'échelle */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          margin: "14px 0 20px",
        }}>
        {[
          { v: 1, label: "égale" },
          { v: 3, label: "modérée" },
          { v: 5, label: "forte" },
          { v: 7, label: "très forte" },
          { v: 9, label: "extrême" },
        ].map(({ v, label }) => (
          <span
            key={v}
            style={{
              padding: "3px 10px",
              borderRadius: 20,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              fontSize: "0.75rem",
              fontFamily: "var(--mono)",
              color: "var(--ink-muted)",
            }}>
            {v} = {label}
          </span>
        ))}
        <span
          style={{
            padding: "3px 10px",
            fontSize: "0.75rem",
            color: "var(--ink-faint)",
          }}>
          1/n = préférence inverse
        </span>
      </div>

      {/* Mode de saisie */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          className={`btn ${inputMode === "select" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "0.8rem", padding: "6px 14px" }}
          onClick={() => setInputMode("select")}>
          Menu déroulant (échelle de Saaty)
        </button>
        <button
          className={`btn ${inputMode === "number" ? "btn-primary" : "btn-secondary"}`}
          style={{ fontSize: "0.8rem", padding: "6px 14px" }}
          onClick={() => setInputMode("number")}>
          Saisie manuelle
        </button>
      </div>

      {/* Matrice */}
      <div className="matrix-wrap">
        <table className="matrix-table">
          <thead>
            <tr>
              <th
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  fontSize: "0.7rem",
                }}>
                Ligne ↓ vs Colonne →
              </th>
              {state.criteria.map((c) => (
                <th key={c} title={c}>
                  {c.length > 10 ? c.slice(0, 10) + "…" : c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.criteria.map((rowC, i) => (
              <tr key={rowC}>
                <th
                  style={{
                    textAlign: "left",
                    padding: "8px 10px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    fontFamily: "var(--sans)",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    maxWidth: 100,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                  {rowC}
                </th>
                {state.criteria.map((colC, j) => {
                  if (i === j)
                    return (
                      <td key={colC} className="diagonal">
                        1
                      </td>
                    );
                  if (i > j) {
                    return (
                      <td key={colC} className="mirror">
                        {matrix[i][j] > 0 ? formatVal(matrix[i][j]) : "—"}
                      </td>
                    );
                  }
                  return (
                    <td key={colC}>
                      {inputMode === "select" ? (
                        <select
                          className="saaty-select"
                          value={matrix[i][j] > 0 ? matrix[i][j] : ""}
                          onChange={(e) =>
                            handleSelectChange(i, j, e.target.value)
                          }>
                          <option value="" disabled>
                            —
                          </option>
                          {SAATY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="number"
                          min="0.111"
                          max="9"
                          step="any"
                          placeholder="1"
                          value={matrix[i][j] > 0 ? matrix[i][j] : ""}
                          onChange={(e) =>
                            handleNumberInput(i, j, e.target.value)
                          }
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="hint" style={{ marginTop: 10 }}>
        <strong>Lecture de la matrice :</strong> La valeur en ligne <em>A</em>,
        colonne <em>B</em>
        signifie &laquo;&nbsp;A est X fois plus important que B&nbsp;&raquo;.
        Les valeurs du triangle inférieur (grisé) sont calculées automatiquement
        (propriété réciproque).
      </div>

      <div
        style={{
          marginTop: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
        <button
          className="btn btn-secondary"
          onClick={onBack}
          disabled={loading}>
          ← Retour
        </button>
        <button
          className="btn btn-primary"
          onClick={() => onCompute(matrix)}
          disabled={!isReady || loading}>
          {loading ? (
            <>
              <span className="spinner" />
              Calcul en cours…
            </>
          ) : (
            "Calculer l'AHP →"
          )}
        </button>
      </div>
    </div>
  );
}
