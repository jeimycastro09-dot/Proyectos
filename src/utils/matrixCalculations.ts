import { MatrixCounts, MatrixMetrics, ClassificationResult } from '../types/game';

export function calculateMetrics(counts: MatrixCounts): MatrixMetrics {
  const { tp, tn, fp, fn } = counts;
  const total = tp + tn + fp + fn;

  // Accuracy: proportion of true results (both true positives and true negatives) among total
  const accuracy = total > 0 ? (tp + tn) / total : 0;

  // Precision: TP / (TP + FP)
  // How many of the positively classified items were actually positive
  const precisionDenominator = tp + fp;
  const precision = precisionDenominator > 0 ? tp / precisionDenominator : 0;

  // Recall (Sensitivity): TP / (TP + FN)
  // How many of the actual positive items were captured
  const recallDenominator = tp + fn;
  const recall = recallDenominator > 0 ? tp / recallDenominator : 0;

  // Specificity: TN / (TN + FP)
  // How many of the actual negative items were correctly identified
  const specificityDenominator = tn + fp;
  const specificity = specificityDenominator > 0 ? tn / specificityDenominator : 0;

  // F1-Score: harmonic mean of Precision and Recall
  const f1Denominator = precision + recall;
  const f1Score = f1Denominator > 0 ? (2 * precision * recall) / f1Denominator : 0;

  // False Positive Rate (FPR): FP / (FP + TN) = 1 - Specificity
  const fpr = specificityDenominator > 0 ? fp / specificityDenominator : 0;

  return {
    total,
    accuracy,
    precision,
    recall,
    specificity,
    f1Score,
    fpr,
  };
}

export function getResultDetails(result: ClassificationResult) {
  switch (result) {
    case 'TP':
      return {
        label: 'Verdadero Positivo (VP)',
        tag: 'VP',
        color: 'text-emerald-400',
        bg: 'bg-emerald-950/80 border-emerald-500/50',
        badgeBg: 'bg-emerald-500 text-slate-950',
        title: '¡Amenaza neutralizada correctamente!',
        explanation: 'La entidad ERA un enemigo real y Mario la pisó/clasificó como amenaza.',
        formulaKey: 'VP',
        impact: '+Puntos, aumenta la Sensibilidad y Precisión.',
        emoji: '👾💥',
      };
    case 'TN':
      return {
        label: 'Verdadero Negativo (VN)',
        tag: 'VN',
        color: 'text-sky-400',
        bg: 'bg-sky-950/80 border-sky-500/50',
        badgeBg: 'bg-sky-500 text-slate-950',
        title: '¡Aliado protegido en paz!',
        explanation: 'La entidad ERA inofensiva y Mario la dejó pasar sin atacarla.',
        formulaKey: 'VN',
        impact: '+Puntos, aumenta la Especificidad y Exactitud.',
        emoji: '🍄🕊️',
      };
    case 'FP':
      return {
        label: 'Falso Positivo (FP) - Error Tipo I',
        tag: 'FP',
        color: 'text-amber-400',
        bg: 'bg-amber-950/80 border-amber-500/50',
        badgeBg: 'bg-amber-500 text-slate-950',
        title: '¡Falsa Alarma! (Inocente pisado)',
        explanation: 'La entidad era INOFENSIVA (Toad), pero Mario la atacó pensando que era un enemigo.',
        formulaKey: 'FP',
        impact: 'Reduce drásticamente la PRECISIÓN. En la vida real: Bloquear emails buenos como Spam, arrestar a inocentes.',
        emoji: '⚠️💔',
      };
    case 'FN':
      return {
        label: 'Falso Negativo (FN) - Error Tipo II',
        tag: 'FN',
        color: 'text-rose-400',
        bg: 'bg-rose-950/80 border-rose-500/50',
        badgeBg: 'bg-rose-500 text-slate-950',
        title: '¡Peligro ignorado! (Invasor pasó)',
        explanation: 'La entidad era una AMENAZA REAL, pero Mario no la detectó y atacó el castillo.',
        formulaKey: 'FN',
        impact: 'Reduce drásticamente el RECALL / SENSIBILIDAD. En la vida real: Dejar pasar un tumor en una biopsia o un ciberataque.',
        emoji: '🚨🏰',
      };
  }
}
