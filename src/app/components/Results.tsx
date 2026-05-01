"use client";

import type { AHPOutput } from "@/lib/ahp";
import type { AppState } from "../page";

interface Props {
  result: AHPOutput;
  state: AppState;
  onReset: () => void;
  onBack: () => void;
}

export default function Results({ result, state, onReset, onBack }: Props) {
  const maxScore =
    result.success && result.ranking.length > 0 ? result.ranking[0].score : 1;

  return (
    <div>
      {/* ── SUCCÈS ──────────────────────────────────────────────────── */}
      {result.success && (
        <>
          {/* Bandeau résultat */}
          <div className="result-hero">
            <p className="label-sm">
              Meilleure alternative pour &laquo;&nbsp;{result.goal}&nbsp;&raquo;
            </p>
            <h2 className="gold">{result.bestAlternative}</h2>
            <div style={{ marginTop: 12 }}>
              <span
                className="cr-badge cr-ok"
                style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>
                ✓ Cohérent · RC = {result.consistency.cr.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Classement */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">
              <span className="step-badge">★</span>
              Classement final
            </div>
            <div className="rank-list">
              {result.ranking.map((item) => (
                <div key={item.name} className={`rank-item rank-${item.rank}`}>
                  <span className="rank-num">{item.rank}</span>
                  <span className="rank-name">{item.name}</span>
                  <div className="score-bar-wrap">
                    <div
                      className="score-bar"
                      style={{ width: `${(item.score / maxScore) * 100}%` }}
                    />
                  </div>
                  <span className="rank-score">
                    {(item.score * 100).toFixed(2)} %
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Poids des critères */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">
              Poids des critères (vecteur de priorité)
            </div>
            <div className="weights-grid">
              {Object.entries(result.criteriaWeights)
                .sort(([, a], [, b]) => b - a)
                .map(([name, w]) => (
                  <div key={name} className="weight-item">
                    <div className="weight-name" title={name}>
                      {name}
                    </div>
                    <div className="weight-val">{(w * 100).toFixed(1)}</div>
                    <div className="weight-pct">% de poids</div>
                  </div>
                ))}
            </div>
          </div>

          {/* Détail de la cohérence */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">
              Vérification de la cohérence (Étape 5)
            </div>
            <div className="consistency-grid">
              <div className="cons-item">
                <div className="cons-label">λmax</div>
                <div className="cons-val">
                  {result.consistency.lambdaMax.toFixed(4)}
                </div>
              </div>
              <div className="cons-item">
                <div className="cons-label">IC</div>
                <div className="cons-val">
                  {result.consistency.ci.toFixed(4)}
                </div>
              </div>
              <div className="cons-item">
                <div className="cons-label">IA (n={result.consistency.n})</div>
                <div className="cons-val">{result.consistency.ri}</div>
              </div>
              <div className="cons-item">
                <div className="cons-label">RC</div>
                <div className="cons-val" style={{ color: "var(--success)" }}>
                  {result.consistency.cr.toFixed(4)}
                </div>
              </div>
            </div>
            <div
              style={{
                marginTop: 14,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}>
              <span className="cr-badge cr-ok">
                ✓ RC ≤ 0,10 — matrice cohérente
              </span>
            </div>
            <p className="hint" style={{ marginTop: 10 }}>
              IC = (λmax − n) / (n − 1) &nbsp;·&nbsp; IA = indice aléatoire de
              Saaty pour n={result.consistency.n} critères &nbsp;·&nbsp; RC = IC
              / IA
            </p>
          </div>

          {/* Tableau des scores normalisés */}
          <div className="card" style={{ marginBottom: 32 }}>
            <div className="card-title">Scores normalisés par critère</div>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.82rem",
                  fontFamily: "var(--mono)",
                }}>
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "8px 12px",
                        borderBottom: "2px solid var(--border)",
                        fontFamily: "var(--sans)",
                        fontSize: "0.75rem",
                        color: "var(--ink-muted)",
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
                          fontFamily: "var(--sans)",
                          fontSize: "0.75rem",
                          color: "var(--ink-muted)",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                        }}>
                        {c}
                      </th>
                    ))}
                    <th
                      style={{
                        textAlign: "center",
                        padding: "8px 8px",
                        borderBottom: "2px solid var(--border)",
                        fontFamily: "var(--sans)",
                        fontSize: "0.75rem",
                        color: "var(--ink-muted)",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                      }}>
                      Score final
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.ranking.map((item, idx) => (
                    <tr
                      key={item.name}
                      style={{
                        background: idx % 2 === 0 ? "#fff" : "var(--paper)",
                      }}>
                      <td
                        style={{
                          padding: "8px 12px",
                          borderBottom: "1px solid var(--border)",
                          fontFamily: "var(--sans)",
                          fontWeight: item.rank === 1 ? 600 : 400,
                        }}>
                        {item.rank === 1 && (
                          <span
                            style={{
                              color: "var(--accent-2)",
                              marginRight: 6,
                            }}>
                            ★
                          </span>
                        )}
                        {item.name}
                      </td>
                      {state.criteria.map((c) => (
                        <td
                          key={c}
                          style={{
                            padding: "8px 8px",
                            borderBottom: "1px solid var(--border)",
                            textAlign: "center",
                            color: "var(--ink-muted)",
                          }}>
                          {(item.normalizedScores[c] * 100).toFixed(1)} %
                        </td>
                      ))}
                      <td
                        style={{
                          padding: "8px 8px",
                          borderBottom: "1px solid var(--border)",
                          textAlign: "center",
                          fontWeight: 600,
                          color:
                            item.rank === 1 ? "var(--accent)" : "var(--ink)",
                        }}>
                        {(item.score * 100).toFixed(2)} %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── MATRICE INCOHÉRENTE ─────────────────────────────────────── */}
      {!result.success && result.errorType === "inconsistent_matrix" && (
        <>
          <div className="inconsistency-box" style={{ marginBottom: 24 }}>
            <h3>⚠ Matrice de comparaison incohérente</h3>
            <pre style={{ marginTop: 14 }}>{result.message}</pre>
            {result.consistency && (
              <div style={{ marginTop: 20 }}>
                <div className="consistency-grid">
                  <div className="cons-item">
                    <div className="cons-label">λmax</div>
                    <div className="cons-val">
                      {result.consistency.lambdaMax.toFixed(4)}
                    </div>
                  </div>
                  <div className="cons-item">
                    <div className="cons-label">IC</div>
                    <div className="cons-val">
                      {result.consistency.ci.toFixed(4)}
                    </div>
                  </div>
                  <div className="cons-item">
                    <div className="cons-label">IA</div>
                    <div className="cons-val">{result.consistency.ri}</div>
                  </div>
                  <div className="cons-item">
                    <div className="cons-label">RC</div>
                    <div className="cons-val" style={{ color: "var(--error)" }}>
                      {result.consistency.cr.toFixed(4)}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <span className="cr-badge cr-bad">
                    ✕ RC = {result.consistency.cr.toFixed(4)} &gt; 0,10
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Poids partiels affichés pour référence */}
          {result.criteriaWeights && (
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-title">
                Poids calculés (indicatifs — matrice incohérente)
              </div>
              <div className="weights-grid">
                {Object.entries(result.criteriaWeights).map(([name, w]) => (
                  <div
                    key={name}
                    className="weight-item"
                    style={{ opacity: 0.7 }}>
                    <div className="weight-name">{name}</div>
                    <div className="weight-val">{(w * 100).toFixed(1)}</div>
                    <div className="weight-pct">% (non fiable)</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── MATRICE INVALIDE ─────────────────────────────────────────── */}
      {!result.success && result.errorType === "invalid_matrix" && (
        <div className="alert alert-error" style={{ marginBottom: 24 }}>
          <p>
            <strong>Matrice invalide :</strong> {result.message}
          </p>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button className="btn btn-secondary" onClick={onReset}>
          ↺ Recommencer
        </button>
        {!result.success && (
          <button className="btn btn-primary" onClick={onBack}>
            ← Corriger la matrice
          </button>
        )}
      </div>
    </div>
  );
}
