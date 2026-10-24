import React, { useState, useMemo } from 'react';
import { calculateMetrics } from '../utils/matrixCalculations';
import { Sliders, HelpCircle, Shield, AlertTriangle, ArrowRight, Zap } from 'lucide-react';

interface SimulatedEntity {
  id: number;
  name: string;
  isRealThreat: boolean; // Ground Truth
  score: number; // Probability output by the model (0.0 to 1.0)
  icon: string;
}

const POPULATION: SimulatedEntity[] = [
  // Friendly Toads (Ground Truth = False)
  { id: 1, name: 'Toad Bebé', isRealThreat: false, score: 0.05, icon: '🍄' },
  { id: 2, name: 'Toad Jardín', isRealThreat: false, score: 0.12, icon: '🍄' },
  { id: 3, name: 'Toad Chef', isRealThreat: false, score: 0.18, icon: '🍄' },
  { id: 4, name: 'Toad Aldeano', isRealThreat: false, score: 0.22, icon: '🍄' },
  { id: 5, name: 'Toad Cartero', isRealThreat: false, score: 0.28, icon: '🍄' },
  { id: 6, name: 'Toad con Farol', isRealThreat: false, score: 0.34, icon: '🍄' },
  { id: 7, name: 'Toad Guardián', isRealThreat: false, score: 0.42, icon: '🍄' },
  { id: 8, name: 'Toad con Paraguas Picudo', isRealThreat: false, score: 0.52, icon: '🍄' },
  { id: 9, name: 'Toad con Capucha Negra', isRealThreat: false, score: 0.62, icon: '🍄' },
  { id: 10, name: 'Toad Disfrazado de Goomba', isRealThreat: false, score: 0.74, icon: '🍄' },

  // Hostile Monsters (Ground Truth = True)
  { id: 11, name: 'Goomba Enano', isRealThreat: true, score: 0.38, icon: '👾' },
  { id: 12, name: 'Goomba con Flor Pacífica', isRealThreat: true, score: 0.48, icon: '👾' },
  { id: 13, name: 'Koopa Tímido', isRealThreat: true, score: 0.58, icon: '🐢' },
  { id: 14, name: 'Goomba Clásico', isRealThreat: true, score: 0.68, icon: '👾' },
  { id: 15, name: 'Goomba Enojado', isRealThreat: true, score: 0.76, icon: '👾' },
  { id: 16, name: 'Spiny con Pinchos', isRealThreat: true, score: 0.82, icon: '🦔' },
  { id: 17, name: 'Koopa Acorazado', isRealThreat: true, score: 0.88, icon: '🐢' },
  { id: 18, name: 'Goomba Volador', isRealThreat: true, score: 0.91, icon: '👾' },
  { id: 19, name: 'Minion de Bowser', isRealThreat: true, score: 0.95, icon: '🐲' },
  { id: 20, name: 'Bowser Clon', isRealThreat: true, score: 0.99, icon: '🐲' },
];

export const ThresholdLab: React.FC = () => {
  const [threshold, setThreshold] = useState<number>(0.5);

  // Compute classifications based on current threshold
  const { counts, categorized } = useMemo(() => {
    let tp = 0;
    let tn = 0;
    let fp = 0;
    let fn = 0;

    const categorizedList = POPULATION.map((entity) => {
      const predictedThreat = entity.score >= threshold;
      let resultCategory: 'TP' | 'TN' | 'FP' | 'FN';

      if (entity.isRealThreat && predictedThreat) {
        resultCategory = 'TP';
        tp++;
      } else if (!entity.isRealThreat && !predictedThreat) {
        resultCategory = 'TN';
        tn++;
      } else if (!entity.isRealThreat && predictedThreat) {
        resultCategory = 'FP';
        fp++;
      } else {
        resultCategory = 'FN';
        fn++;
      }

      return {
        ...entity,
        predictedThreat,
        resultCategory,
      };
    });

    return {
      counts: { tp, tn, fp, fn },
      categorized: categorizedList,
    };
  }, [threshold]);

  const metrics = calculateMetrics(counts);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-slate-900 border-2 border-slate-700/80 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-2 text-cyan-400 font-pixel text-xs">
          <Sliders className="w-4 h-4" />
          <span>SIMULADOR DE UMBRAL DE DECISIÓN (THRESHOLD & TRADE-OFF)</span>
        </div>
        <h2 className="text-xl font-bold text-white mb-2 font-pixel">
          ¿CÓMO SURGEN LOS FALSOS POSITIVOS Y NEGATIVOS?
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
          Los modelos de Machine Learning no dicen simplemente "es enemigo" o "es amigo": calculan una{' '}
          <strong className="text-cyan-400">probabilidad de sospecha</strong> entre 0.0 y 1.0.{' '}
          <strong>Mario decide el Umbral ($\theta$)</strong>: Si la sospecha supera el umbral, Mario
          pisa (Predecir Amenaza). Si es menor, lo deja pasar (Predecir Seguro).
        </p>
      </div>

      {/* Threshold Controller Card */}
      <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs text-slate-400 font-mono block">
              PARÁMETRO CLAVE DEL CLASIFICADOR:
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-pixel text-xl sm:text-2xl text-cyan-400">
                Umbral $\theta$ = {threshold.toFixed(2)}
              </span>
              <span className="text-xs font-mono text-slate-300">
                ({Math.round(threshold * 100)}% de sospecha mínima para pisar)
              </span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setThreshold(0.2)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-mono border border-slate-700 transition-colors"
            >
              Umbral Bajo (0.20)
            </button>
            <button
              onClick={() => setThreshold(0.5)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono border border-slate-700 transition-colors"
            >
              Estándar (0.50)
            </button>
            <button
              onClick={() => setThreshold(0.8)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-mono border border-slate-700 transition-colors"
            >
              Umbral Alto (0.80)
            </button>
          </div>
        </div>

        {/* Range Slider */}
        <div className="py-2">
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-2">
            <span className="text-rose-400">
              ← 0.0 (Mario paranoico: pisa a casi todos)
            </span>
            <span className="text-amber-400">
              1.0 (Mario ultra-confiado: deja pasar a todos) →
            </span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.95"
            step="0.01"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Interactive Population Spectrum Map */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400">
              Población evaluada en la escala de probabilidad:
            </span>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1 text-sky-400">
                <span>🍄</span> Inocente Real
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span>👾</span> Amenaza Real
              </span>
            </div>
          </div>

          {/* Visual Spectrum Bar */}
          <div className="relative h-28 bg-slate-900 rounded-xl border border-slate-800 p-2 overflow-hidden flex items-center">
            {/* Split zone coloring */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-sky-950/40 border-r-2 border-dashed border-cyan-400 flex items-start p-2 pointer-events-none"
              style={{ width: `${threshold * 100}%` }}
            >
              <span className="text-[9px] font-pixel text-sky-400 bg-slate-950/80 px-2 py-0.5 rounded border border-sky-500/30">
                ZONA: DEJAR PASAR (PREDICCIÓN SEGURA)
              </span>
            </div>

            <div
              className="absolute right-0 top-0 bottom-0 bg-red-950/40 flex items-start justify-end p-2 pointer-events-none"
              style={{ width: `${(1 - threshold) * 100}%` }}
            >
              <span className="text-[9px] font-pixel text-red-400 bg-slate-950/80 px-2 py-0.5 rounded border border-red-500/30">
                ZONA: PISAR (PREDICCIÓN AMENAZA)
              </span>
            </div>

            {/* Threshold Vertical Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_12px_#22d3ee] z-20 pointer-events-none"
              style={{ left: `${threshold * 100}%` }}
            >
              <div className="absolute -top-1 -translate-x-1/2 bg-cyan-400 text-slate-950 text-[8px] font-pixel px-1 rounded">
                $\theta$
              </div>
            </div>

            {/* Entities plotted on the spectrum */}
            <div className="w-full relative h-16 z-10">
              {categorized.map((item, idx) => {
                const leftPct = item.score * 100;
                const isTopRow = idx % 2 === 0;

                let badgeColor = '';
                if (item.resultCategory === 'TP') badgeColor = 'border-emerald-400 bg-emerald-950/90 text-emerald-300';
                if (item.resultCategory === 'TN') badgeColor = 'border-sky-400 bg-sky-950/90 text-sky-300';
                if (item.resultCategory === 'FP') badgeColor = 'border-amber-400 bg-amber-950/90 text-amber-300 animate-bounce';
                if (item.resultCategory === 'FN') badgeColor = 'border-rose-400 bg-rose-950/90 text-rose-300 animate-pulse';

                return (
                  <div
                    key={item.id}
                    className={`absolute -translate-x-1/2 p-1 rounded border shadow-md flex items-center gap-1 cursor-help transition-all duration-300 group ${badgeColor}`}
                    style={{
                      left: `${leftPct}%`,
                      top: isTopRow ? '0px' : '32px',
                    }}
                    title={`${item.name} | Real: ${item.isRealThreat ? 'Amenaza' : 'Inocente'} | Score: ${item.score} | Resultado: ${item.resultCategory}`}
                  >
                    <span className="text-xs">{item.icon}</span>
                    <span className="text-[9px] font-pixel font-bold">
                      {item.resultCategory}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Metrics and Confusion Matrix under this threshold */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Resulting 2x2 Matrix */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-pixel text-yellow-400 block mb-3">
              MATRIZ CON UMBRAL = {threshold.toFixed(2)}
            </span>
            <div className="grid grid-cols-2 gap-2 text-center font-mono">
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40">
                <span className="text-[10px] text-emerald-400 block font-pixel">VP</span>
                <span className="text-xl font-bold text-white">{counts.tp}</span>
                <span className="text-[9px] text-slate-400 block">Amenazas pisadas</span>
              </div>
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40">
                <span className="text-[10px] text-rose-400 block font-pixel">FN (Tipo II)</span>
                <span className="text-xl font-bold text-rose-300">{counts.fn}</span>
                <span className="text-[9px] text-slate-400 block">Enemigos pasaron</span>
              </div>
              <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-500/40">
                <span className="text-[10px] text-amber-400 block font-pixel">FP (Tipo I)</span>
                <span className="text-xl font-bold text-amber-300">{counts.fp}</span>
                <span className="text-[9px] text-slate-400 block">Inocentes pisados</span>
              </div>
              <div className="p-3 rounded-lg bg-sky-950/60 border border-sky-500/40">
                <span className="text-[10px] text-sky-400 block font-pixel">VN</span>
                <span className="text-xl font-bold text-white">{counts.tn}</span>
                <span className="text-[9px] text-slate-400 block">Inocentes protegidos</span>
              </div>
            </div>
          </div>

          {/* Trade-off Insights */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-pixel text-cyan-400 block mb-2">
                BALANCE PRECISIÓN VS RECALL
              </span>
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-amber-300 font-bold">Precisión:</span>
                  <span className="text-white">{(metrics.precision * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-200"
                    style={{ width: `${metrics.precision * 100}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs font-mono">
                  <span className="text-rose-300 font-bold">Recall / Sensibilidad:</span>
                  <span className="text-white">{(metrics.recall * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-400 transition-all duration-200"
                    style={{ width: `${metrics.recall * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
              {threshold < 0.35 ? (
                <div className="flex items-start gap-1.5 text-rose-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    <strong>Umbral muy bajo:</strong> Mario tiene <strong>alto Recall</strong> (no
                    deja escapar enemigos), pero sufre <strong>baja Precisión</strong> por pisar
                    demasiados Toads inocentes (Falsos Positivos).
                  </span>
                </div>
              ) : threshold > 0.65 ? (
                <div className="flex items-start gap-1.5 text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    <strong>Umbral muy alto:</strong> Mario tiene <strong>alta Precisión</strong> (casi
                    no daña inocentes), pero sufre <strong>bajo Recall</strong> porque muchos
                    monstruos se infiltran en el castillo (Falsos Negativos).
                  </span>
                </div>
              ) : (
                <div className="flex items-start gap-1.5 text-emerald-300">
                  <Zap className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>
                    <strong>Zona de equilibrio:</strong> Compromiso armónico optimizando el{' '}
                    <strong>F1-Score ({(metrics.f1Score * 100).toFixed(1)}%)</strong>.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
