import React, { useState } from 'react';
import { GameMode, MatrixCounts, ClassificationResult, GameLogEntry } from './types/game';
import { calculateMetrics } from './utils/matrixCalculations';
import { MarioGameCanvas } from './components/MarioGameCanvas';
import { ConfusionMatrixGrid } from './components/ConfusionMatrixGrid';
import { MetricsBar } from './components/MetricsBar';
import { MatrixAcademy } from './components/MatrixAcademy';
import { ThresholdLab } from './components/ThresholdLab';
import { GameQuiz } from './components/GameQuiz';
import { ClassificationHistory } from './components/ClassificationHistory';
import { InteractiveContextIntro } from './components/InteractiveContextIntro';
import { Gamepad2, BookOpen, Sliders, Award, Sparkles, HelpCircle, Compass, Lightbulb } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<GameMode>('arcade');

  // Global game matrix counts
  const [counts, setCounts] = useState<MatrixCounts>({
    tp: 0,
    tn: 0,
    fp: 0,
    fn: 0,
  });

  const [lastResult, setLastResult] = useState<ClassificationResult | null>(null);
  const [logs, setLogs] = useState<GameLogEntry[]>([]);

  const metrics = calculateMetrics(counts);

  const handleMatrixUpdate = (
    newCounts: MatrixCounts,
    result: ClassificationResult,
    log: GameLogEntry
  ) => {
    setCounts(newCounts);
    setLastResult(result);
    setLogs((prev) => [...prev, log]);
  };

  const handleResetCounts = () => {
    setCounts({ tp: 0, tn: 0, fp: 0, fn: 0 });
    setLastResult(null);
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Top Retro Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-600 border-2 border-red-400 flex items-center justify-center shadow-lg shadow-red-950">
              <span className="font-pixel text-sm text-white font-bold">M</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-pixel text-xs sm:text-sm text-yellow-400 tracking-wider">
                  SUPER CONFUSION BROS
                </h1>
                <span className="hidden sm:inline text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  ML EDICIÓN
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Aprende la Matriz de Confusión con Falsos Positivos y Negativos
              </p>
            </div>
          </div>

          {/* Clean Segmented Tab Navigation (zero-pill discipline) */}
          <nav className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('intro')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'intro'
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Contexto e Intuición</span>
            </button>

            <button
              onClick={() => setActiveTab('arcade')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'arcade'
                  ? 'bg-red-600 text-white font-semibold shadow-md shadow-red-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Modo Arcade</span>
            </button>

            <button
              onClick={() => setActiveTab('academy')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'academy'
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Academia de la Matriz</span>
            </button>

            <button
              onClick={() => setActiveTab('threshold')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'threshold'
                  ? 'bg-cyan-600 text-white font-semibold shadow-md shadow-cyan-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Lab del Umbral</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all shrink-0 ${
                activeTab === 'quiz'
                  ? 'bg-amber-600 text-white font-semibold shadow-md shadow-amber-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Desafío Quiz</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* TAB 0: CONTEXTO E INTUICIÓN FUNDAMENTAL */}
        {activeTab === 'intro' && (
          <InteractiveContextIntro onGoToGame={() => setActiveTab('arcade')} />
        )}

        {/* TAB 1: ARCADE GAMEPLAY */}
        {activeTab === 'arcade' && (
          <div className="flex flex-col gap-6">
            {/* Quick Context Banner */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 shadow-md">
              <div className="flex items-center gap-2 max-w-2xl">
                <Sparkles className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>
                  <strong>Tu Misión:</strong> Eres Mario, el modelo detector de amenazas.
                  Identifica a los <strong>Goombas reales (VP)</strong> y protege a los{' '}
                  <strong>Toads pacíficos (VN)</strong> sin cometer <strong>Falsos Positivos</strong>{' '}
                  ni <strong>Falsos Negativos</strong>.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('intro')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Ver contexto previo</span>
                </button>
                <div className="hidden sm:flex items-center gap-1 font-mono text-[11px]">
                  <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    ESPACIO = Pisar
                  </span>
                  <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    Z = Pasar
                  </span>
                </div>
              </div>
            </div>

            {/* Mario Canvas Game Engine */}
            <MarioGameCanvas
              onMatrixUpdate={handleMatrixUpdate}
              currentCounts={counts}
              onResetCounts={handleResetCounts}
            />

            {/* Real-time Metrics Dashboard Bar */}
            <MetricsBar metrics={metrics} />

            {/* Matrix & Logs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2">
                <ConfusionMatrixGrid
                  counts={counts}
                  lastResult={lastResult}
                  interactive={true}
                  onUpdateCounts={(updated) => setCounts(updated)}
                />
              </div>
              <div className="lg:col-span-1">
                <ClassificationHistory logs={logs} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACADEMIA DE LA MATRIZ */}
        {activeTab === 'academy' && <MatrixAcademy />}

        {/* TAB 3: LABORATORIO DEL UMBRAL */}
        {activeTab === 'threshold' && <ThresholdLab />}

        {/* TAB 4: QUIZ DE MAESTRÍA */}
        {activeTab === 'quiz' && <GameQuiz />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-[10px] text-yellow-400">
              SUPER CONFUSION BROS
            </span>
            <span>·</span>
            <span>Didáctica de Machine Learning & Evaluación de Clasificadores</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            VP = Acierto Amenaza | VN = Acierto Amigo | FP = Falsa Alarma | FN = Peligro Omitido
          </div>
        </div>
      </footer>
    </div>
  );
}
