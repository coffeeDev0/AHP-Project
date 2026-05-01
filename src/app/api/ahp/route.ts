import { NextRequest, NextResponse } from "next/server";
import { runAHP, SAATY_SCALE } from "@/lib/ahp";
import type { Alternative } from "@/lib/ahp";

// GET /api/ahp — retourne l'échelle de Saaty
export async function GET() {
  return NextResponse.json({ saatyScale: SAATY_SCALE });
}

// POST /api/ahp — exécute le calcul AHP complet
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Corps JSON invalide." },
      { status: 400 },
    );
  }

  const { goal, criteria, alternatives, pairwiseMatrix } = body as {
    goal?: string;
    criteria?: string[];
    alternatives?: Alternative[];
    pairwiseMatrix?: number[][];
  };

  // ── Validation des entrées ────────────────────────────────────────────────
  if (!goal || typeof goal !== "string" || goal.trim() === "") {
    return NextResponse.json(
      { error: "Le champ 'goal' (objectif) est requis." },
      { status: 422 },
    );
  }
  if (!Array.isArray(criteria) || criteria.length < 2) {
    return NextResponse.json(
      { error: "Le champ 'criteria' doit contenir au moins 2 critères." },
      { status: 422 },
    );
  }
  if (!Array.isArray(alternatives) || alternatives.length < 2) {
    return NextResponse.json(
      {
        error: "Le champ 'alternatives' doit contenir au moins 2 alternatives.",
      },
      { status: 422 },
    );
  }
  if (!Array.isArray(pairwiseMatrix)) {
    return NextResponse.json(
      { error: "Le champ 'pairwiseMatrix' est requis." },
      { status: 422 },
    );
  }

  // Critères uniques
  if (new Set(criteria).size !== criteria.length) {
    return NextResponse.json(
      { error: "Les noms des critères doivent être uniques." },
      { status: 422 },
    );
  }

  // Noms d'alternatives uniques
  const altNames = alternatives.map((a) => a.name);
  if (new Set(altNames).size !== altNames.length) {
    return NextResponse.json(
      { error: "Les noms des alternatives doivent être uniques." },
      { status: 422 },
    );
  }

  // Chaque alternative doit avoir un score pour chaque critère
  for (const alt of alternatives) {
    const missing = criteria.filter((c) => !(c in alt.scores));
    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: `L'alternative "${alt.name}" n'a pas de score pour : ${missing.join(", ")}.`,
        },
        { status: 422 },
      );
    }
  }

  // ── Exécution AHP ─────────────────────────────────────────────────────────
  const result = runAHP(goal, criteria, alternatives, pairwiseMatrix);
  return NextResponse.json(result);
}
