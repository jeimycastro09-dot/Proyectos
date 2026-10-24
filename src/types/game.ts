export type EntityType = 'goomba' | 'koopa' | 'spiny' | 'toad' | 'friendly_koopa' | 'star_mushroom';

export interface EntityTelemetry {
  threatProbability: number; // 0 to 1
  hostilityLevel: number; // 0 to 100
  spikesDetected: boolean;
  friendlyAura: number; // 0 to 100
  disguiseSuspected: boolean;
}

export interface GameEntity {
  id: string;
  type: EntityType;
  name: string;
  isRealThreat: boolean; // Ground Truth: true = Threat (Positive), false = Friendly (Negative)
  x: number;
  y: number;
  vx: number;
  width: number;
  height: number;
  speed: number;
  telemetry: EntityTelemetry;
  description: string;
  appearance: {
    hatColor?: string;
    bodyColor: string;
    hasSpikes: boolean;
    accessory?: string;
  };
  processed?: boolean;
}

export type ClassificationAction = 'stomp_threat' | 'allow_friendly';

export type ClassificationResult = 'TP' | 'TN' | 'FP' | 'FN';

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  color: string;
  bg: string;
  opacity: number;
  resultType?: ClassificationResult;
}

export interface MatrixCounts {
  tp: number; // Verdaderos Positivos (Amenaza pisada)
  tn: number; // Verdaderos Negativos (Inocente dejado pasar)
  fp: number; // Falsos Positivos (Inocente pisado por error - Error Tipo I)
  fn: number; // Falsos Negativos (Amenaza ignorada que atacó el castillo - Error Tipo II)
}

export interface MatrixMetrics {
  total: number;
  accuracy: number; // Exactitud: (TP + TN) / Total
  precision: number; // Precisión: TP / (TP + FP)
  recall: number; // Sensibilidad / Exhaustividad: TP / (TP + FN)
  specificity: number; // Especificidad: TN / (TN + FP)
  f1Score: number; // F1: 2 * (P * R) / (P + R)
  fpr: number; // False Positive Rate: FP / (FP + TN)
}

export interface GameLogEntry {
  id: string;
  entityName: string;
  isRealThreat: boolean;
  predictedThreat: boolean;
  result: ClassificationResult;
  timestamp: number;
  reason: string;
}

export type GameMode = 'arcade' | 'academy' | 'threshold' | 'quiz';

export interface LevelConfig {
  id: number;
  name: string;
  description: string;
  spawnInterval: number; // ms
  targetEntities: number;
  speedMultiplier: number;
  allowDisguised: boolean;
  goal: string;
}
