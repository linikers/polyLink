// Intelligence Score — cálculo dos sub-scores e score composto

export interface IntelligenceScores {
  composite: number;       // 0-100
  liquidityScore: number;  // 0-100
  volumeScore: number;     // 0-100
  volatilityScore: number; // 0-100
  whaleScore: number;      // 0-100
  edgeScore: number;       // 0-100
  newsScore: number;       // 0-100
  grade: "excellent" | "good" | "fair" | "poor";
}

interface CalcInput {
  liquidity: number;
  volume: number;
  openInterest: number;
  yesPrice: number;       // 0-1
  noPrice: number;        // 0-1
  change24h?: number;     // % change (e.g., 0.05 = 5%)
  category?: string;
  edgeEstimate?: number;  // user's manual Edge Score estimate (0-100)
  whaleActivity?: number; // 0-100 — how active whales are in this market
  newsRelevance?: number; // 0-100 — news relevance to this category
  maxLiquidity?: number;
  maxVolume?: number;
}

// Normalize a value against a max, returning 0-100
function norm(value: number, max: number, minBound = 0): number {
  if (max <= 0) return 50; // default middle score when no data
  return Math.min(100, Math.max(0, Math.round(((value - minBound) / (max - minBound)) * 100)));
}

// Score from 0-100 based on how balanced the YES/NO price is
function calcUncertaintyScore(yesPrice: number, noPrice: number): number {
  // Markets near 50/50 get higher uncertainty = more opportunity
  const certainty = Math.abs(yesPrice - 0.5);
  return Math.round((1 - certainty * 2) * 100);
}

export function calcIntelligenceScores(input: CalcInput): IntelligenceScores {
  const {
    liquidity,
    volume,
    openInterest,
    yesPrice,
    noPrice,
    change24h = 0,
    edgeEstimate,
    whaleActivity,
    newsRelevance,
    maxLiquidity = 500000,
    maxVolume = 5000000,
  } = input;

  // 1. Liquidity Score (0-100)
  const liquidityScore = norm(liquidity, maxLiquidity);

  // 2. Volume Score (0-100)
  const volumeScore = norm(volume, maxVolume);

  // 3. Volatility Score (0-100)
  // Higher price change = more volatility = more opportunity
  const absChange = Math.abs(change24h);
  const volatilityScore = Math.min(100, Math.round(absChange * 500));

  // 4. Whale Interest Score (0-100)
  // If whale activity is provided, use it; otherwise infer from volume
  const whaleScore = whaleActivity !== undefined
    ? whaleActivity
    : Math.min(100, norm(volume * openInterest, maxVolume * 100000));

  // 5. Edge Score (0-100)
  // If user provided an Edge Score estimate, use it; otherwise infer from uncertainty
  const edgeScore = edgeEstimate !== undefined
    ? edgeEstimate
    : calcUncertaintyScore(yesPrice, noPrice);

  // 6. News Relevance Score (0-100)
  const newsScore = newsRelevance !== undefined
    ? newsRelevance
    : calcUncertaintyScore(yesPrice, noPrice) * 0.5 + 25; // base 25-75

  // Composite (weighted)
  const composite = Math.round(
    liquidityScore * 0.10 +
    volumeScore * 0.10 +
    volatilityScore * 0.15 +
    whaleScore * 0.20 +
    edgeScore * 0.30 +
    newsScore * 0.15
  );

  // Grade
  let grade: IntelligenceScores["grade"];
  if (composite >= 75) grade = "excellent";
  else if (composite >= 55) grade = "good";
  else if (composite >= 35) grade = "fair";
  else grade = "poor";

  return {
    composite,
    liquidityScore,
    volumeScore,
    volatilityScore,
    whaleScore,
    edgeScore,
    newsScore,
    grade,
  };
}

export function intelligenceGradeLabel(grade: IntelligenceScores["grade"], lang: "pt-BR" | "en"): string {
  const labels = {
    "pt-BR": { excellent: "Excelente", good: "Boa", fair: "Regular", poor: "Fraca" },
    en: { excellent: "Excellent", good: "Good", fair: "Fair", poor: "Poor" },
  };
  return labels[lang][grade];
}

export function intelligenceGradeColor(grade: IntelligenceScores["grade"]): string {
  switch (grade) {
    case "excellent": return "#3fb950";
    case "good": return "#7c3aed";
    case "fair": return "#f0883e";
    case "poor": return "#f85149";
  }
}

export function intelligenceGradeIcon(grade: IntelligenceScores["grade"]): string {
  switch (grade) {
    case "excellent": return "🧠";
    case "good": return "👍";
    case "fair": return "⚠️";
    case "poor": return "❌";
  }
}
