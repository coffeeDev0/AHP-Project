"use client";

import { useState, KeyboardEvent } from "react";
import type { AppState } from "../page";

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  onNext: () => void;
}

export default function StepCriteria({ state, setState, onNext }: Props) {
  const [criterionInput, setCriterionInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const addCriterion = () => {
    const name = criterionInput.trim();
    if (!name) return;
    if (state.criteria.includes(name)) {
      setError(`"${name}" est déjà dans la liste des critères.`);
      return;
    }
    setState((s) => ({ ...s, criteria: [...s.criteria, name] }));
    setCriterionInput("");
    setError(null);
  };

  const removeCriterion = (name: string) => {
    setState((s) => ({ ...s, criteria: s.criteria.filter((c) => c !== name) }));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCriterion();
    }
  };

  const canProceed = state.goal.trim().length > 0 && state.criteria.length >= 3;

  return (
    <div className="card">
      <div className="card-title">
        <span className="step-badge">1</span>
        Définir votre problème de décision
      </div>

      {/* Objectif */}
      <div>
        <label htmlFor="goal">Objectif de la décision</label>
        <input
          id="goal"
          type="text"
          placeholder="ex. Choisir le meilleur ordinateur portable pour l'université"
          value={state.goal}
          onChange={(e) => setState((s) => ({ ...s, goal: e.target.value }))}
        />
        <p className="hint">
          Décrivez ce que vous souhaitez décider en une phrase.
        </p>
      </div>

      {/* Critères */}
      <div className="field-gap">
        <label htmlFor="criterion-input">Critères d&apos;évaluation</label>
        <div className="row" style={{ alignItems: "flex-end" }}>
          <input
            id="criterion-input"
            type="text"
            placeholder="ex. Prix, Performance, Autonomie…"
            value={criterionInput}
            onChange={(e) => {
              setCriterionInput(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
          />
          <button
            className="btn btn-secondary"
            style={{ flexShrink: 0, whiteSpace: "nowrap" }}
            onClick={addCriterion}
            disabled={!criterionInput.trim()}>
            + Ajouter
          </button>
        </div>
        <p className="hint">
          Appuyez sur Entrée ou cliquez sur Ajouter. Il faut au minimum 3
          critères.
        </p>

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

        {state.criteria.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 14,
            }}>
            {state.criteria.map((c) => (
              <span key={c} className="tag">
                {c}
                <button
                  className="tag-remove"
                  onClick={() => removeCriterion(c)}
                  title={`Supprimer ${c}`}>
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {state.criteria.length === 1 && (
          <p
            style={{
              marginTop: 10,
              fontSize: "0.82rem",
              color: "var(--accent-2)",
            }}>
            Ajoutez au moins un critère supplémentaire pour continuer.
          </p>
        )}
      </div>

      {/* Explication AHP */}
      <div
        style={{
          marginTop: 24,
          padding: "14px 18px",
          background: "var(--surface)",
          borderRadius: "var(--radius)",
          borderLeft: "3px solid var(--border)",
        }}>
        <p style={{ fontSize: "0.82rem", color: "var(--ink-muted)" }}>
          <strong style={{ color: "var(--ink)" }}>
            Comment fonctionne l&apos;AHP&nbsp;:
          </strong>{" "}
          Vous définirez vos alternatives et les noterez sur chaque critère,
          puis vous remplirez une matrice de comparaison par paires exprimant
          vos préférences relatives entre les critères. L&apos;AHP calcule un
          ratio de cohérence (RC) — si RC ≤ 0,10, vos préférences sont
          cohérentes et un classement est produit.
        </p>
      </div>

      <div
        style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={!canProceed}>
          Suivant : Alternatives →
        </button>
      </div>
    </div>
  );
}
