"use client";

import { useState, useCallback } from "react";
import type { AHPOutput } from "@/lib/ahp";
import StepCriteria from "./components/StepCriteria";
import StepAlternatives from "./components/StepAlternatives";
import StepMatrix from "./components/StepMatrix";
import Results from "./components/Results";
import React from "react";

export type Step = 1 | 2 | 3 | 4;

export interface AppState {
  goal: string;
  criteria: string[];
  alternatives: { name: string; scores: Record<string, number> }[];
  matrix: number[][];
}

const STEPS = [
  { n: 1 as Step, label: "Objectif & Critères" },
  { n: 2 as Step, label: "Alternatives" },
  { n: 3 as Step, label: "Matrice de comparaison" },
  { n: 4 as Step, label: "Résultats" },
];

export default function HomePage() {
  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState<AppState>({
    goal: "",
    criteria: [],
    alternatives: [],
    matrix: [],
  });
  const [result, setResult] = useState<AHPOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const goTo = useCallback((s: Step) => setStep(s), []);

  const handleCompute = useCallback(
    async (matrix: number[][]) => {
      setLoading(true);
      setApiError(null);
      try {
        const res = await fetch("/api/ahp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            goal: state.goal,
            criteria: state.criteria,
            alternatives: state.alternatives,
            pairwiseMatrix: matrix,
          }),
        });
        const data: AHPOutput = await res.json();
        setResult(data);
        setStep(4);
      } catch {
        setApiError("Erreur réseau. Vérifiez votre connexion et réessayez.");
      } finally {
        setLoading(false);
      }
    },
    [state],
  );

  const reset = useCallback(() => {
    setState({ goal: "", criteria: [], alternatives: [], matrix: [] });
    setResult(null);
    setApiError(null);
    setStep(1);
  }, []);

  return (
    <>
      {/* Stepper */}
      <div className="stepper">
        {STEPS.map((s, idx) => (
          <React.Fragment key={s.n}>
            <div
              className={`stepper-step ${step === s.n ? "active" : step > s.n ? "done" : ""}`}>
              <div className="stepper-dot" />
              <span>{s.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div key={`line-${idx}`} className="stepper-line" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Introduction — affichée uniquement à l'étape 1 */}
      {step === 1 && (
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ marginBottom: 10 }}>Prenez de meilleures décisions</h1>
          <p style={{ maxWidth: 560 }}>
            Le Processus d&apos;Analyse Hiérarchique (AHP) vous aide à choisir
            parmi plusieurs alternatives évaluées sur plusieurs critères — avec
            une vérification mathématique de la cohérence de vos préférences
            (méthode de Saaty, RC ≤ 0,10).
          </p>
        </div>
      )}

      {/* Erreur API */}
      {apiError && (
        <div className="alert alert-error" style={{ marginBottom: 24 }}>
          <p>{apiError}</p>
        </div>
      )}

      {/* Étapes */}
      {step === 1 && (
        <StepCriteria
          state={state}
          setState={setState}
          onNext={() => goTo(2)}
        />
      )}
      {step === 2 && (
        <StepAlternatives
          state={state}
          setState={setState}
          onBack={() => goTo(1)}
          onNext={() => goTo(3)}
        />
      )}
      {step === 3 && (
        <StepMatrix
          state={state}
          setState={setState}
          onBack={() => goTo(2)}
          onCompute={handleCompute}
          loading={loading}
        />
      )}
      {step === 4 && result && (
        <Results
          result={result}
          state={state}
          onReset={reset}
          onBack={() => goTo(3)}
        />
      )}
    </>
  );
}
