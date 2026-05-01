// ============================================================
// lib/ahp.ts — Logique AHP (tourne côté serveur dans l'API route)
// Implémente la méthode de Saaty en 5 étapes.
// Fonctions pures — sans effets de bord, entièrement testables.
// ============================================================

export interface Alternative {
  name: string;
  scores: Record<string, number>;
}

export interface ConsistencyResult {
  lambdaMax: number;
  n: number;
  ci: number;
  ri: number;
  cr: number;
  isConsistent: boolean;
  lambdaPerCriterion: number[];
}

export interface RankedAlternative {
  name: string;
  score: number;
  rank: number;
  normalizedScores: Record<string, number>;
}

export interface AHPResult {
  success: true;
  goal: string;
  criteriaWeights: Record<string, number>;
  consistency: ConsistencyResult;
  ranking: RankedAlternative[];
  bestAlternative: string;
}

export interface AHPError {
  success: false;
  errorType: "invalid_matrix" | "inconsistent_matrix";
  message: string;
  consistency?: ConsistencyResult;
  criteriaWeights?: Record<string, number>;
}

export type AHPOutput = AHPResult | AHPError;

// Indice Aléatoire (IA) de Saaty pour n = 1..10
const RANDOM_INDEX: Record<number, number> = {
  1: 0.0,
  2: 0.0,
  3: 0.58,
  4: 0.9,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
};

// Échelle fondamentale de Saaty 1–9
export const SAATY_SCALE = [
  {
    value: 1,
    label: "Importance égale",
    description: "Les deux critères contribuent également à l'objectif",
  },
  {
    value: 2,
    label: "Légèrement supérieure",
    description: "Entre égale et modérée",
  },
  {
    value: 3,
    label: "Importance modérée",
    description: "Un critère est légèrement favorisé",
  },
  { value: 4, label: "Modérée+", description: "Entre modérée et forte" },
  {
    value: 5,
    label: "Importance forte",
    description: "Un critère est nettement favorisé",
  },
  { value: 6, label: "Forte+", description: "Entre forte et très forte" },
  {
    value: 7,
    label: "Importance très forte",
    description: "Supériorité démontrée en pratique",
  },
  {
    value: 8,
    label: "Très très forte",
    description: "Entre très forte et extrême",
  },
  {
    value: 9,
    label: "Importance extrême",
    description: "Supériorité affirmée au plus haut degré",
  },
];

// ── 1. Validation de la matrice ────────────────────────────────────────────
export function validateMatrix(matrix: number[][]): {
  valid: boolean;
  message: string;
} {
  const n = matrix.length;

  if (n < 2)
    return {
      valid: false,
      message: "La matrice doit comporter au moins 2 critères.",
    };

  for (let i = 0; i < n; i++) {
    if (matrix[i].length !== n) {
      return {
        valid: false,
        message: `La matrice n'est pas carrée : la ligne ${i + 1} contient ${matrix[i].length} éléments au lieu de ${n}.`,
      };
    }
  }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const v = matrix[i][j];
      if (v <= 0)
        return {
          valid: false,
          message: `Toutes les valeurs doivent être positives. Valeur ${v} trouvée en (${i + 1}, ${j + 1}).`,
        };
      if (v < 1 / 9 - 1e-6 || v > 9 + 1e-6) {
        return {
          valid: false,
          message: `La valeur ${v.toFixed(4)} en (${i + 1}, ${j + 1}) est hors de l'échelle de Saaty [1/9 .. 9].`,
        };
      }
      if (i === j && Math.abs(v - 1.0) > 1e-6) {
        return {
          valid: false,
          message: `L'élément diagonal en (${i + 1}, ${i + 1}) doit être égal à 1 (trouvé : ${v}).`,
        };
      }
      if (Math.abs(matrix[i][j] * matrix[j][i] - 1.0) > 1e-4) {
        return {
          valid: false,
          message:
            `Propriété réciproque non respectée en (${i + 1},${j + 1}) et (${j + 1},${i + 1}) : ` +
            `${matrix[i][j].toFixed(4)} × ${matrix[j][i].toFixed(4)} = ${(matrix[i][j] * matrix[j][i]).toFixed(4)} ≠ 1. ` +
            `Si le critère A est évalué ${matrix[i][j]}× supérieur à B, alors B doit être ${(1 / matrix[i][j]).toFixed(4)}× par rapport à A.`,
        };
      }
    }
  }
  return { valid: true, message: "OK" };
}

// ── 2. Calcul des poids des critères (vecteur de priorité) ─────────────────
// Étape 1 : normaliser chaque colonne (÷ somme de colonne)
// Étape 2 : moyenne de chaque ligne = poids du critère
export function computeWeights(matrix: number[][]): number[] {
  const n = matrix.length;
  const colSums = Array(n).fill(0);
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) colSums[j] += matrix[i][j];

  const normalized = matrix.map((row) => row.map((v, j) => v / colSums[j]));
  return normalized.map((row) => row.reduce((a, b) => a + b, 0) / n);
}

// ── 3. Vérification de la cohérence ────────────────────────────────────────
// λmax = moyenne de (A·w)[i] / w[i]
// IC = (λmax - n) / (n - 1)
// RC = IC / IA[n]   →  cohérent si RC ≤ 0,10
export function computeConsistency(
  matrix: number[][],
  weights: number[],
): ConsistencyResult {
  const n = matrix.length;
  const weightedSum = matrix.map((row) =>
    row.reduce((sum, v, j) => sum + v * weights[j], 0),
  );
  const lambdaValues = weightedSum.map((ws, i) => ws / weights[i]);
  const lambdaMax = lambdaValues.reduce((a, b) => a + b, 0) / n;

  const ci = n > 1 ? (lambdaMax - n) / (n - 1) : 0;
  const ri = RANDOM_INDEX[Math.min(n, 10)] ?? 1.49;
  const cr = ri > 0 ? ci / ri : 0;

  return {
    lambdaMax: round6(lambdaMax),
    n,
    ci: round6(ci),
    ri,
    cr: round6(cr),
    isConsistent: cr <= 0.1,
    lambdaPerCriterion: lambdaValues.map(round6),
  };
}

// ── 4. Explication de l'incohérence ────────────────────────────────────────
export function explainInconsistency(
  consistency: ConsistencyResult,
  criteriaNames: string[],
): string {
  const { cr, lambdaMax, lambdaPerCriterion } = consistency;
  const deviations = lambdaPerCriterion.map((l) => Math.abs(l - lambdaMax));
  const sorted = [...deviations.map((d, i) => ({ d, i }))].sort(
    (a, b) => b.d - a.d,
  );
  const top = sorted
    .slice(0, Math.min(3, criteriaNames.length))
    .map((x) => criteriaNames[x.i]);

  return (
    `Votre matrice de comparaison par paires est INCOHÉRENTE (RC = ${cr.toFixed(4)} > 0,10). ` +
    `Cela signifie que vos préférences ne sont pas pleinement transitives — par exemple, si A est préféré à B et B à C, ` +
    `la relation implicite A/C dans votre matrice est contradictoire.\n\n` +
    `Les comparaisons les plus incohérentes concernent : ${top.join(", ")}.\n\n` +
    `Comment corriger :\n` +
    `• Réexaminez les comparaisons impliquant "${top[0]}".\n` +
    `• Assurez la transitivité : si A > B et B > C, alors A doit être proportionnellement plus important que C.\n` +
    `• Utilisez uniquement des valeurs comprises dans l'échelle de Saaty (1 à 9).\n` +
    `• Visez un RC ≤ 0,10 pour valider la cohérence.`
  );
}

// ── 5. Score final des alternatives ────────────────────────────────────────
// Normalise les scores par colonne, puis produit scalaire pondéré avec les poids des critères.
export function scoreAlternatives(
  alternatives: Alternative[],
  criteria: string[],
  weights: number[],
): RankedAlternative[] {
  const raw: number[][] = alternatives.map((alt) =>
    criteria.map((c) => alt.scores[c] ?? 0),
  );
  const colSums = criteria.map((_, j) => raw.reduce((s, row) => s + row[j], 0));
  const norm: number[][] = raw.map((row) =>
    row.map((v, j) => (colSums[j] > 0 ? v / colSums[j] : 0)),
  );

  const scored: RankedAlternative[] = alternatives.map((alt, i) => {
    const score = norm[i].reduce((s, v, j) => s + v * weights[j], 0);
    const normalizedScores: Record<string, number> = {};
    criteria.forEach((c, j) => {
      normalizedScores[c] = round4(norm[i][j]);
    });
    return { name: alt.name, score: round6(score), rank: 0, normalizedScores };
  });

  scored.sort((a, b) => b.score - a.score);

  let rank = 1;
  scored.forEach((item, idx) => {
    if (idx > 0 && item.score < scored[idx - 1].score) rank = idx + 1;
    item.rank = rank;
  });

  return scored;
}

// ── Pipeline complet ────────────────────────────────────────────────────────
export function runAHP(
  goal: string,
  criteria: string[],
  alternatives: Alternative[],
  pairwiseMatrix: number[][],
): AHPOutput {
  if (pairwiseMatrix.length !== criteria.length) {
    return {
      success: false,
      errorType: "invalid_matrix",
      message: `La matrice est de taille ${pairwiseMatrix.length}×${pairwiseMatrix.length} mais vous avez défini ${criteria.length} critères. Elles doivent correspondre.`,
    };
  }

  const { valid, message } = validateMatrix(pairwiseMatrix);
  if (!valid) return { success: false, errorType: "invalid_matrix", message };

  const weights = computeWeights(pairwiseMatrix);
  const criteriaWeights: Record<string, number> = {};
  criteria.forEach((c, i) => {
    criteriaWeights[c] = round4(weights[i]);
  });

  const consistency = computeConsistency(pairwiseMatrix, weights);

  if (!consistency.isConsistent) {
    return {
      success: false,
      errorType: "inconsistent_matrix",
      message: explainInconsistency(consistency, criteria),
      consistency,
      criteriaWeights,
    };
  }

  const ranking = scoreAlternatives(alternatives, criteria, weights);

  return {
    success: true,
    goal,
    criteriaWeights,
    consistency,
    ranking,
    bestAlternative: ranking[0].name,
  };
}

// ── Utilitaires ─────────────────────────────────────────────────────────────
const round4 = (n: number) => Math.round(n * 10000) / 10000;
const round6 = (n: number) => Math.round(n * 1000000) / 1000000;
