import React, { useState } from 'react';
import { MatrixCounts } from '../types/game';
import { calculateMetrics } from '../utils/matrixCalculations';
import { InteractiveContextIntro } from './InteractiveContextIntro';
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  HeartHandshake,
  Stethoscope,
  Mail,
  Scale,
  BrainCircuit,
  HelpCircle,
  Lightbulb,
  Sparkles,
  Compass,
} from 'lucide-react';

export const MatrixAcademy: React.FC = () => {
  const [showIntro, setShowIntro] = useState<boolean>(false);
  // Interactive sandbox state for the academy calculator
  const [sandboxCounts, setSandboxCounts] = useState<MatrixCounts>({
    tp: 45,
    tn: 40,
    fp: 8,
    fn: 7,
  });

  const metrics = calculateMetrics(sandboxCounts);

  const presets = [
    {
      name: 'Mario Equilibrado',
      desc: 'Buen balance general entre Precisión y Recall.',
      counts: { tp: 45, tn: 45, fp: 5, fn: 5 },
    },
    {
      name: 'Mario Paranoico (Todo es amenaza)',
      desc: 'Pisa todo lo que se mueve para que ningún enemigo pase. ¡Cero FN, pero muchos FP!',
      counts: { tp: 50, tn: 10, fp: 40, fn: 0 },
    },
    {
      name: 'Mario Confiado (Todo es amigo)',
      desc: 'No quiere herir a ningún inocente (Cero FP), pero los monstruos destruyen el castillo (Muchos FN).',
      counts: { tp: 10, tn: 50, fp: 0, fn: 40 },
    },
    {
      name: 'Reino Desbalanceado (Plaga de Goombas)',
      desc: 'El 90% son enemigos. La exactitud puede engañar si no miras la matriz.',
      counts: { tp: 85, tn: 5, fp: 5, fn: 5 },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-red-950/60 via-slate-900 to-amber-950/60 border-2 border-red-500/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2 text-red-400 font-pixel text-xs tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>GUÍA DIDÁCTICA INTERACTIVA</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 font-pixel leading-relaxed">
            ¿QUÉ ES LA MATRIZ DE CONFUSIÓN?
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            En Inteligencia Artificial y Ciencia de Datos, un clasificador binario debe tomar una
            decisión: <em>¿Es esto un caso positivo o negativo?</em> La <strong>Matriz de Confusión</strong>{' '}
            es la tabla de verdad 2x2 que contrasta lo que ocurrió en la{' '}
            <strong className="text-white">realidad</strong> contra lo que el{' '}
            <strong className="text-white">modelo predijo</strong>.
          </p>
        </div>

        <button
          onClick={() => setShowIntro(!showIntro)}
          className="shrink-0 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-pixel text-xs flex items-center gap-2 shadow-lg shadow-indigo-950 transition-all hover:scale-105 active:scale-95"
        >
          <Compass className="w-4 h-4" />
          <span>{showIntro ? 'OCULTAR CONTEXTO' : '¿POR QUÉ EXISTE?'}</span>
        </button>
      </div>

      {/* Collapsible Interactive Context Intro */}
      {showIntro && (
        <InteractiveContextIntro onClose={() => setShowIntro(false)} />
      )}

      {/* The 4 Quadrants Visualized */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Verdadero Positivo */}
        <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-pixel text-xs px-2.5 py-1 rounded bg-emerald-500 text-slate-950">
                VP · VERDADERO POSITIVO
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-emerald-300 mb-1">
              Amenaza real neutralizada (Acierto)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              <strong>En el juego:</strong> La criatura era un Goomba peligroso y Mario saltó sobre él
              clasificándolo como enemigo.
            </p>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
              <div className="text-emerald-400 font-semibold mb-1">Impacto:</div>
              Aumenta tanto la <strong>Precisión</strong> como la <strong>Sensibilidad (Recall)</strong>.
            </div>
          </div>
        </div>

        {/* Verdadero Negativo */}
        <div className="bg-slate-900 border-2 border-sky-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-pixel text-xs px-2.5 py-1 rounded bg-sky-500 text-slate-950">
                VN · VERDADERO NEGATIVO
              </span>
              <HeartHandshake className="w-5 h-5 text-sky-400" />
            </div>
            <h3 className="text-base font-bold text-sky-300 mb-1">
              Aliado inofensivo protegido (Acierto)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              <strong>En el juego:</strong> La criatura era un pacífico Toad y Mario la dejó pasar al castillo
              en completa armonía.
            </p>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
              <div className="text-sky-400 font-semibold mb-1">Impacto:</div>
              Aumenta la <strong>Especificidad</strong> y la <strong>Exactitud general</strong> del reino.
            </div>
          </div>
        </div>

        {/* Falso Positivo (Error Tipo I) */}
        <div className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-pixel text-xs px-2.5 py-1 rounded bg-amber-500 text-slate-950">
                FP · FALSO POSITIVO (TIPO I)
              </span>
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-base font-bold text-amber-300 mb-1">
              Falsa Alarma (Inocente condenado)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              <strong>En el juego:</strong> Era un Toad inocente, pero Mario creyó que era un enemigo y lo
              pisó por error.
            </p>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
              <div className="text-amber-400 font-semibold mb-1">Pérdida en ML:</div>
              Destruye la <strong>PRECISIÓN</strong>: <code className="text-amber-300">VP / (VP + FP)</code>.
              Significa que tus alarmas no son confiables.
            </div>
          </div>
        </div>

        {/* Falso Negativo (Error Tipo II) */}
        <div className="bg-slate-900 border-2 border-rose-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-pixel text-xs px-2.5 py-1 rounded bg-rose-500 text-white">
                FN · FALSO NEGATIVO (TIPO II)
              </span>
              <ShieldAlert className="w-5 h-5 text-rose-400" />
            </div>
            <h3 className="text-base font-bold text-rose-300 mb-1">
              Peligro inadvertido (Enemigo infiltrado)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              <strong>En el juego:</strong> Era un Goomba camuflado y Mario no lo detectó, permitiendo que
              derribara el Castillo de Peach.
            </p>
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono">
              <div className="text-rose-400 font-semibold mb-1">Pérdida en ML:</div>
              Destruye el <strong>RECALL / SENSIBILIDAD</strong>: <code className="text-rose-300">VP / (VP + FN)</code>.
              Significa que las amenazas reales se te están escapando.
            </div>
          </div>
        </div>
      </div>

      {/* Real-World Dilemma: ¿Qué error es más costoso? */}
      <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-3">
          <Scale className="w-5 h-5 text-yellow-400" />
          <h3 className="font-pixel text-sm text-yellow-400">
            EL DILEMA: ¿QUÉ ES PEOR, UN FALSO POSITIVO O UN FALSO NEGATIVO?
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
          La respuesta en Machine Learning siempre es: <strong>depende del dominio</strong>. Ningún
          modelo es perfecto, por lo que los científicos de datos deben calibrar el umbral para
          favorecer la métrica más crítica.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Caso Medicina */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-rose-400 font-bold text-xs">
                <Stethoscope className="w-4 h-4" />
                <span>DIAGNÓSTICO MÉDICO</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Si un paciente tiene cáncer y el modelo dice que está sano (<strong>Falso Negativo</strong>),
                la persona no recibe tratamiento a tiempo y puede morir.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-300 bg-emerald-950/60 p-2 rounded border border-emerald-500/30">
              Prioridad: <strong>MAXIMIZAR RECALL</strong> (minimizar FN a toda costa).
            </div>
          </div>

          {/* Caso Filtro Spam */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold text-xs">
                <Mail className="w-4 h-4" />
                <span>FILTRO ANTISPAM</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Si un correo de confirmación de tu universidad o trabajo va a Spam (<strong>Falso Positivo</strong>),
                el usuario pierde una oportunidad vital.
              </p>
            </div>
            <div className="text-[11px] font-mono text-amber-300 bg-amber-950/60 p-2 rounded border border-amber-500/30">
              Prioridad: <strong>MAXIMIZAR PRECISIÓN</strong> (minimizar FP molestos).
            </div>
          </div>

          {/* Caso Justicia Penal */}
          <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 text-sky-400 font-bold text-xs">
                <Scale className="w-4 h-4" />
                <span>JUSTICIA Y LEY</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Principio de Blackstone: Condenar a una persona inocente (<strong>Falso Positivo</strong>)
                es una violación inaceptable a los derechos fundamentales.
              </p>
            </div>
            <div className="text-[11px] font-mono text-sky-300 bg-sky-950/60 p-2 rounded border border-sky-500/30">
              Prioridad: <strong>EVITAR FALSOS POSITIVOS</strong> ("Más allá de toda duda razonable").
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Sandbox Simulator */}
      <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <h3 className="font-pixel text-xs sm:text-sm text-indigo-300">
              LABORATORIO CALCULADOR DE LA MATRIZ
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Experimenta en vivo
          </span>
        </div>

        {/* Preset buttons */}
        <div className="mb-4">
          <span className="text-[11px] text-slate-400 font-mono block mb-2">
            Cargar Escenarios Predefinidos:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setSandboxCounts(p.counts)}
                className="text-left p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 transition-all text-xs"
              >
                <div className="font-bold text-indigo-300 text-[11px] truncate">{p.name}</div>
                <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Sliders for the 4 Quadrants */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800 mb-4">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-emerald-400 font-bold">Verdaderos Positivos (VP):</span>
              <span className="font-pixel text-emerald-300">{sandboxCounts.tp}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sandboxCounts.tp}
              onChange={(e) =>
                setSandboxCounts({ ...sandboxCounts, tp: parseInt(e.target.value) || 0 })
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-rose-400 font-bold">Falsos Negativos (FN):</span>
              <span className="font-pixel text-rose-300">{sandboxCounts.fn}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sandboxCounts.fn}
              onChange={(e) =>
                setSandboxCounts({ ...sandboxCounts, fn: parseInt(e.target.value) || 0 })
              }
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-amber-400 font-bold">Falsos Positivos (FP):</span>
              <span className="font-pixel text-amber-300">{sandboxCounts.fp}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sandboxCounts.fp}
              onChange={(e) =>
                setSandboxCounts({ ...sandboxCounts, fp: parseInt(e.target.value) || 0 })
              }
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-sky-400 font-bold">Verdaderos Negativos (VN):</span>
              <span className="font-pixel text-sky-300">{sandboxCounts.tn}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sandboxCounts.tn}
              onChange={(e) =>
                setSandboxCounts({ ...sandboxCounts, tn: parseInt(e.target.value) || 0 })
              }
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Calculated Results */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 font-mono uppercase block">
              Exactitud (Accuracy)
            </span>
            <span className="font-pixel text-lg text-white">
              {(metrics.accuracy * 100).toFixed(1)}%
            </span>
            <span className="text-[9px] text-slate-500 block mt-1 font-mono">
              ({sandboxCounts.tp}+{sandboxCounts.tn})/{metrics.total}
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-amber-400 font-mono uppercase block">
              Precisión
            </span>
            <span className="font-pixel text-lg text-amber-300">
              {(metrics.precision * 100).toFixed(1)}%
            </span>
            <span className="text-[9px] text-slate-500 block mt-1 font-mono">
              {sandboxCounts.tp}/({sandboxCounts.tp}+{sandboxCounts.fp})
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-rose-400 font-mono uppercase block">
              Sensibilidad (Recall)
            </span>
            <span className="font-pixel text-lg text-rose-300">
              {(metrics.recall * 100).toFixed(1)}%
            </span>
            <span className="text-[9px] text-slate-500 block mt-1 font-mono">
              {sandboxCounts.tp}/({sandboxCounts.tp}+{sandboxCounts.fn})
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-emerald-400 font-mono uppercase block">
              F1-Score
            </span>
            <span className="font-pixel text-lg text-emerald-300">
              {(metrics.f1Score * 100).toFixed(1)}%
            </span>
            <span className="text-[9px] text-slate-500 block mt-1 font-mono">
              Media Armónica
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
