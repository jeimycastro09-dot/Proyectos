import React, { useState } from 'react';
import { MatrixCounts, ClassificationResult } from '../types/game';
import { getResultDetails } from '../utils/matrixCalculations';
import { Info, HelpCircle, ShieldAlert, HeartHandshake, CheckCircle2, AlertOctagon } from 'lucide-react';

interface ConfusionMatrixGridProps {
  counts: MatrixCounts;
  lastResult?: ClassificationResult | null;
  interactive?: boolean;
  onUpdateCounts?: (newCounts: MatrixCounts) => void;
}

export const ConfusionMatrixGrid: React.FC<ConfusionMatrixGridProps> = ({
  counts,
  lastResult,
  interactive = false,
  onUpdateCounts,
}) => {
  const [selectedCell, setSelectedCell] = useState<ClassificationResult | null>(lastResult || 'TP');

  const total = counts.tp + counts.tn + counts.fp + counts.fn;

  const getPercent = (val: number) => {
    if (total === 0) return '0%';
    return `${Math.round((val / total) * 100)}%`;
  };

  const handleAdjust = (key: keyof MatrixCounts, delta: number) => {
    if (!onUpdateCounts) return;
    const current = counts[key];
    const updated = Math.max(0, current + delta);
    onUpdateCounts({
      ...counts,
      [key]: updated,
    });
  };

  const activeDetail = selectedCell ? getResultDetails(selectedCell) : getResultDetails('TP');

  return (
    <div className="bg-slate-900 border-2 border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
          <h3 className="font-pixel text-xs sm:text-sm text-yellow-400 tracking-wider">
            MATRIZ DE CONFUSIÓN
          </h3>
        </div>
        <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
          <span>Total evaluados:</span>
          <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
            {total}
          </span>
        </div>
      </div>

      {/* Grid Container with Axis labels */}
      <div className="relative">
        {/* Label: Predicción (Columnas) */}
        <div className="text-center pb-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            PREDICCIÓN DE MARIO (ACCIÓN DEL MODELO)
          </div>
          <div className="text-[10px] text-slate-400">
            ¿Mario decidió clasificar como Amenaza o como Inocente?
          </div>
        </div>

        <div className="grid grid-cols-[auto_1fr_1fr] gap-2 items-stretch">
          {/* Top Header Row for Columns */}
          <div className="w-16 sm:w-24"></div>
          <div className="text-center p-2 rounded-lg bg-red-950/40 border border-red-500/30">
            <span className="font-pixel text-[9px] sm:text-[10px] text-red-300 block">
              PREDIJO AMENAZA
            </span>
            <span className="text-[10px] text-red-200/70 font-mono">
              (Pisó / Eliminó)
            </span>
          </div>
          <div className="text-center p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
            <span className="font-pixel text-[9px] sm:text-[10px] text-emerald-300 block">
              PREDIJO INOFENSIVO
            </span>
            <span className="text-[10px] text-emerald-200/70 font-mono">
              (Dejó pasar / Paz)
            </span>
          </div>

          {/* Row 1: REALIDAD ES AMENAZA (Clase Positiva Real) */}
          <div className="flex flex-col justify-center items-center text-center p-2 rounded-lg bg-red-950/40 border border-red-500/30">
            <span className="font-pixel text-[8px] sm:text-[9px] text-red-300 leading-tight block">
              REALIDAD:
            </span>
            <span className="text-[10px] font-bold text-red-400">
              AMENAZA
            </span>
            <span className="text-[9px] text-red-300/70 font-mono">(Goomba)</span>
          </div>

          {/* CELL 1: VERDADERO POSITIVO (VP) */}
          <div
            onClick={() => setSelectedCell('TP')}
            className={`cursor-pointer transition-all duration-200 p-3 sm:p-4 rounded-xl border-2 flex flex-col justify-between relative overflow-hidden group ${
              selectedCell === 'TP'
                ? 'border-emerald-400 bg-emerald-950/80 ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-950/50'
                : 'border-emerald-700/50 bg-emerald-950/30 hover:border-emerald-500 hover:bg-emerald-950/50'
            } ${lastResult === 'TP' ? 'animate-pulse' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-pixel text-[10px] text-emerald-400 font-bold block">
                  VP (Verdadero +)
                </span>
                <span className="text-[10px] text-emerald-300/80">
                  Amenaza acertada
                </span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="my-2 flex items-baseline justify-between">
              <span className="font-pixel text-2xl sm:text-3xl text-emerald-300">
                {counts.tp}
              </span>
              <span className="text-xs font-mono text-emerald-400/90 font-semibold">
                {getPercent(counts.tp)}
              </span>
            </div>

            {interactive && (
              <div className="flex items-center gap-1 mt-1 pt-1 border-t border-emerald-900/60 justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdjust('tp', -1);
                  }}
                  className="w-5 h-5 rounded bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-xs font-bold"
                >
                  -
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdjust('tp', 1);
                  }}
                  className="w-5 h-5 rounded bg-emerald-900 hover:bg-emerald-800 text-emerald-200 text-xs font-bold"
                >
                  +
                </button>
              </div>
            )}
            <div className="text-[9px] text-emerald-300/70 font-mono mt-1">
              ¡Goomba pisado con éxito!
            </div>
          </div>

          {/* CELL 2: FALSO NEGATIVO (FN - Error Tipo II) */}
          <div
            onClick={() => setSelectedCell('FN')}
            className={`cursor-pointer transition-all duration-200 p-3 sm:p-4 rounded-xl border-2 flex flex-col justify-between relative overflow-hidden group ${
              selectedCell === 'FN'
                ? 'border-rose-400 bg-rose-950/80 ring-2 ring-rose-500/50 shadow-lg shadow-rose-950/50'
                : 'border-rose-700/50 bg-rose-950/30 hover:border-rose-500 hover:bg-rose-950/50'
            } ${lastResult === 'FN' ? 'animate-pulse' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-pixel text-[10px] text-rose-400 font-bold block">
                  FN (Falso -)
                </span>
                <span className="text-[10px] text-rose-300/80">
                  ¡Error Tipo II!
                </span>
              </div>
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>

            <div className="my-2 flex items-baseline justify-between">
              <span className="font-pixel text-2xl sm:text-3xl text-rose-300">
                {counts.fn}
              </span>
              <span className="text-xs font-mono text-rose-400/90 font-semibold">
                {getPercent(counts.fn)}
              </span>
            </div>

            {interactive && (
              <div className="flex items-center gap-1 mt-1 pt-1 border-t border-rose-900/60 justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdjust('fn', -1);
                  }}
                  className="w-5 h-5 rounded bg-rose-900 hover:bg-rose-800 text-rose-200 text-xs font-bold"
                >
                  -
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdjust('fn', 1);
                  }}
                  className="w-5 h-5 rounded bg-rose-900 hover:bg-rose-800 text-rose-200 text-xs font-bold"
                >
                  +
                </button>
              </div>
            )}
            <div className="text-[9px] text-rose-300/70 font-mono mt-1">
              ¡Monstruo atacó el castillo!
            </div>
          </div>

          {/* Row 2: REALIDAD ES INOFENSIVO (Clase Negativa Real) */}
          <div className="flex flex-col justify-center items-center text-center p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
            <span className="font-pixel text-[8px] sm:text-[9px] text-emerald-300 leading-tight block">
              REALIDAD:
            </span>
            <span className="text-[10px] font-bold text-emerald-400">
              INOFENSIVO
            </span>
            <span className="text-[9px] text-emerald-300/70 font-mono">(Toad)</span>
          </div>

          {/* CELL 3: FALSO POSITIVO (FP - Error Tipo I) */}
          <div
            onClick={() => setSelectedCell('FP')}
            className={`cursor-pointer transition-all duration-200 p-3 sm:p-4 rounded-xl border-2 flex flex-col justify-between relative overflow-hidden group ${
              selectedCell === 'FP'
                ? 'border-amber-400 bg-amber-950/80 ring-2 ring-amber-500/50 shadow-lg shadow-amber-950/50'
                : 'border-amber-700/50 bg-amber-950/30 hover:border-amber-500 hover:bg-amber-950/50'
            } ${lastResult === 'FP' ? 'animate-pulse' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-pixel text-[10px] text-amber-400 font-bold block">
                  FP (Falso +)
                </span>
                <span className="text-[10px] text-amber-300/80">
                  ¡Error Tipo I!
                </span>
              </div>
              <AlertOctagon className="w-5 h-5 text-amber-400" />
            </div>

            <div className="my-2 flex items-baseline justify-between">
              <span className="font-pixel text-2xl sm:text-3xl text-amber-300">
                {counts.fp}
              </span>
              <span className="text-xs font-mono text-amber-400/90 font-semibold">
                {getPercent(counts.fp)}
              </span>
            </div>

            {interactive && (
              <div className="flex items-center gap-1 mt-1 pt-1 border-t border-amber-900/60 justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdjust('fp', -1);
                  }}
                  className="w-5 h-5 rounded bg-amber-900 hover:bg-amber-800 text-amber-200 text-xs font-bold"
                >
                  -
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdjust('fp', 1);
                  }}
                  className="w-5 h-5 rounded bg-amber-900 hover:bg-amber-800 text-amber-200 text-xs font-bold"
                >
                  +
                </button>
              </div>
            )}
            <div className="text-[9px] text-amber-300/70 font-mono mt-1">
              ¡Toad inocente pisado!
            </div>
          </div>

          {/* CELL 4: VERDADERO NEGATIVO (VN) */}
          <div
            onClick={() => setSelectedCell('TN')}
            className={`cursor-pointer transition-all duration-200 p-3 sm:p-4 rounded-xl border-2 flex flex-col justify-between relative overflow-hidden group ${
              selectedCell === 'TN'
                ? 'border-sky-400 bg-sky-950/80 ring-2 ring-sky-500/50 shadow-lg shadow-sky-950/50'
                : 'border-sky-700/50 bg-sky-950/30 hover:border-sky-500 hover:bg-sky-950/50'
            } ${lastResult === 'TN' ? 'animate-pulse' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-pixel text-[10px] text-sky-400 font-bold block">
                  VN (Verdadero -)
                </span>
                <span className="text-[10px] text-sky-300/80">
                  Inocente protegido
                </span>
              </div>
              <HeartHandshake className="w-5 h-5 text-sky-400" />
            </div>

            <div className="my-2 flex items-baseline justify-between">
              <span className="font-pixel text-2xl sm:text-3xl text-sky-300">
                {counts.tn}
              </span>
              <span className="text-xs font-mono text-sky-400/90 font-semibold">
                {getPercent(counts.tn)}
              </span>
            </div>

            {interactive && (
              <div className="flex items-center gap-1 mt-1 pt-1 border-t border-sky-900/60 justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdjust('tn', -1);
                  }}
                  className="w-5 h-5 rounded bg-sky-900 hover:bg-sky-800 text-sky-200 text-xs font-bold"
                >
                  -
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdjust('tn', 1);
                  }}
                  className="w-5 h-5 rounded bg-sky-900 hover:bg-sky-800 text-sky-200 text-xs font-bold"
                >
                  +
                </button>
              </div>
            )}
            <div className="text-[9px] text-sky-300/70 font-mono mt-1">
              ¡Toad pasó a salvo en paz!
            </div>
          </div>
        </div>
      </div>

      {/* Selected Cell Deep-Dive Card */}
      {activeDetail && (
        <div className={`p-3.5 rounded-xl border ${activeDetail.bg} transition-all duration-300`}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`px-2 py-0.5 rounded text-[10px] font-pixel ${activeDetail.badgeBg}`}>
              {activeDetail.tag}
            </span>
            <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
              <span>{activeDetail.emoji}</span>
              <span>{activeDetail.label}</span>
            </h4>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed mb-2">
            {activeDetail.explanation}
          </p>
          <div className="text-[11px] text-slate-300/90 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 flex items-start gap-1.5">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Consecuencia en ML: </strong>
              {activeDetail.impact}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
