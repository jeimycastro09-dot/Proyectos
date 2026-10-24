import React from 'react';
import { MatrixMetrics } from '../types/game';
import { Target, Zap, ShieldCheck, Activity, Award } from 'lucide-react';

interface MetricsBarProps {
  metrics: MatrixMetrics;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ metrics }) => {
  const formatPct = (val: number) => {
    return `${(val * 100).toFixed(1)}%`;
  };

  const getMetricColor = (val: number) => {
    if (val >= 0.8) return 'text-emerald-400 bg-emerald-500';
    if (val >= 0.5) return 'text-amber-400 bg-amber-500';
    return 'text-rose-400 bg-rose-500';
  };

  return (
    <div className="bg-slate-900 border-2 border-slate-700/80 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h3 className="font-pixel text-xs text-cyan-400 uppercase tracking-wider">
            MÉTRICAS DE RENDIMIENTO DEL MODELO
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          Fórmulas en tiempo real
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Exactitud (Accuracy) */}
        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex flex-col justify-between group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              Exactitud (Accuracy)
            </span>
          </div>
          <div className="my-1.5 flex items-baseline justify-between">
            <span className="font-pixel text-lg sm:text-xl text-white">
              {formatPct(metrics.accuracy)}
            </span>
            <span className="text-[9px] font-mono text-slate-400">
              (VP+VN)/Total
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getMetricColor(metrics.accuracy).split(' ')[1]}`}
              style={{ width: `${metrics.accuracy * 100}%` }}
            />
          </div>
          <div className="text-[9px] text-slate-400 mt-1.5 truncate">
            Aciertos globales de Mario
          </div>
        </div>

        {/* Precisión (Precision) */}
        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex flex-col justify-between group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              Precisión (Precision)
            </span>
          </div>
          <div className="my-1.5 flex items-baseline justify-between">
            <span className="font-pixel text-lg sm:text-xl text-amber-300">
              {formatPct(metrics.precision)}
            </span>
            <span className="text-[9px] font-mono text-slate-400">
              VP/(VP+FP)
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getMetricColor(metrics.precision).split(' ')[1]}`}
              style={{ width: `${metrics.precision * 100}%` }}
            />
          </div>
          <div className="text-[9px] text-amber-300/80 mt-1.5 truncate">
            Penalizada por Falsos Positivos
          </div>
        </div>

        {/* Sensibilidad / Exhaustividad (Recall) */}
        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex flex-col justify-between group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              Recall / Sensibilidad
            </span>
          </div>
          <div className="my-1.5 flex items-baseline justify-between">
            <span className="font-pixel text-lg sm:text-xl text-rose-300">
              {formatPct(metrics.recall)}
            </span>
            <span className="text-[9px] font-mono text-slate-400">
              VP/(VP+FN)
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getMetricColor(metrics.recall).split(' ')[1]}`}
              style={{ width: `${metrics.recall * 100}%` }}
            />
          </div>
          <div className="text-[9px] text-rose-300/80 mt-1.5 truncate">
            Penalizada por Falsos Negativos
          </div>
        </div>

        {/* F1-Score */}
        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex flex-col justify-between group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              F1-Score
            </span>
          </div>
          <div className="my-1.5 flex items-baseline justify-between">
            <span className="font-pixel text-lg sm:text-xl text-emerald-300">
              {formatPct(metrics.f1Score)}
            </span>
            <span className="text-[9px] font-mono text-slate-400">
              2*(P*R)/(P+R)
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getMetricColor(metrics.f1Score).split(' ')[1]}`}
              style={{ width: `${metrics.f1Score * 100}%` }}
            />
          </div>
          <div className="text-[9px] text-emerald-300/80 mt-1.5 truncate">
            Equilibrio armónico P vs R
          </div>
        </div>
      </div>
    </div>
  );
};
