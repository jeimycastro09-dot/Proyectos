import React, { useState } from 'react';
import { sounds } from '../utils/sound';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Lightbulb,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';

interface InteractiveContextIntroProps {
  onClose?: () => void;
  onGoToGame?: () => void;
}

interface TestCharacter {
  id: number;
  name: string;
  appearance: string;
  isRealThreat: boolean;
  threatClues: string;
  suspicionScore: number;
  avatar: string;
  avatarBg: string;
}

const TEST_CHARACTERS: TestCharacter[] = [
  {
    id: 1,
    name: 'Goomba Colmilludo',
    appearance: 'Cejas fruncidas, colmillos afilados, camina rápido hacia el portón.',
    isRealThreat: true,
    threatClues: 'Pinchos visibles, actitud hostil.',
    suspicionScore: 92,
    avatar: '👾',
    avatarBg: 'bg-red-950 border-red-500/50',
  },
  {
    id: 2,
    name: 'Toad Jardinerito',
    appearance: 'Lleva una cesta de flores silvestres y una gran sonrisa pacífica.',
    isRealThreat: false,
    threatClues: 'Sin armas, actitud alegre.',
    suspicionScore: 8,
    avatar: '🍄',
    avatarBg: 'bg-sky-950 border-sky-500/50',
  },
  {
    id: 3,
    name: 'Toad con Paraguas Picudo (¡Caso Trampa!)',
    appearance: 'Un inocente Toad que lleva un paraguas triangular que parece un casco de pinchos de Bowser.',
    isRealThreat: false,
    threatClues: 'Su paraguas se parece a un arma, pero es inofensivo.',
    suspicionScore: 65,
    avatar: '☂️🍄',
    avatarBg: 'bg-amber-950 border-amber-500/50',
  },
  {
    id: 4,
    name: 'Goomba Panadero (¡Caso Engañoso!)',
    appearance: 'Lleva un gorro blanco de cocinero y una bandeja de pasteles, pero debajo oculta dinamita.',
    isRealThreat: true,
    threatClues: 'Disfraz pacífico, pero en la realidad es un villano.',
    suspicionScore: 40,
    avatar: '👨‍🍳👾',
    avatarBg: 'bg-rose-950 border-rose-500/50',
  },
];

export const InteractiveContextIntro: React.FC<InteractiveContextIntroProps> = ({
  onClose,
  onGoToGame,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [userDecisions, setUserDecisions] = useState<{
    [key: number]: 'attack' | 'allow' | null;
  }>({
    1: null,
    2: null,
    3: null,
    4: null,
  });

  const activeChar = TEST_CHARACTERS[currentStep];
  const decision = userDecisions[activeChar?.id];

  const handleMakeDecision = (action: 'attack' | 'allow') => {
    setUserDecisions((prev) => ({
      ...prev,
      [activeChar.id]: action,
    }));

    if (activeChar.isRealThreat && action === 'attack') {
      sounds.playStomp();
    } else if (!activeChar.isRealThreat && action === 'allow') {
      sounds.playPassFriendly();
    } else if (!activeChar.isRealThreat && action === 'attack') {
      sounds.playFalsePositive();
    } else {
      sounds.playFalseNegative();
    }
  };

  const getOutcome = () => {
    if (!decision) return null;
    const isThreat = activeChar.isRealThreat;
    const attacked = decision === 'attack';

    if (isThreat && attacked) {
      return {
        type: 'VP',
        title: '¡ACIERTO! Verdadero Positivo (VP)',
        textColor: 'text-emerald-400',
        bgColor: 'bg-emerald-950/70 border-emerald-500/60',
        badgeBg: 'bg-emerald-500 text-slate-950',
        desc: 'Era un peligro real y lo detuviste. En Machine Learning, cuando un caso positivo real es detectado correctamente, es un Verdadero Positivo.',
      };
    } else if (!isThreat && !attacked) {
      return {
        type: 'VN',
        title: '¡ACIERTO! Verdadero Negativo (VN)',
        textColor: 'text-sky-400',
        bgColor: 'bg-sky-950/70 border-sky-500/60',
        badgeBg: 'bg-sky-500 text-slate-950',
        desc: 'Era un inocente y lo dejaste en paz. En Machine Learning, cuando un caso negativo real se clasifica como seguro, es un Verdadero Negativo.',
      };
    } else if (!isThreat && attacked) {
      return {
        type: 'FP',
        title: '¡ERROR TIPO I! Falso Positivo (Falsa Alarma)',
        textColor: 'text-amber-400',
        bgColor: 'bg-amber-950/70 border-amber-500/60',
        badgeBg: 'bg-amber-500 text-slate-950',
        desc: '¡Atacaste a un inocente! Pensaste que era peligroso, pero era un aliado. En la vida real: enviar un correo legítimo a Spam, o acusar a un inocente.',
      };
    } else {
      return {
        type: 'FN',
        title: '¡ERROR TIPO II! Falso Negativo (Peligro Omitido)',
        textColor: 'text-rose-400',
        bgColor: 'bg-rose-950/70 border-rose-500/60',
        badgeBg: 'bg-rose-500 text-white',
        desc: '¡Dejaste pasar al villano! Parecía pacífico con su delantal, pero invadió el castillo. En la vida real: no detectar un tumor en una radiografía o ignorar un fraude bancario.',
      };
    }
  };

  const outcome = getOutcome();

  return (
    <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Close option if modal */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400 flex items-center justify-center text-indigo-300 shadow-md">
            <Compass className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <span className="font-pixel text-[10px] text-indigo-400 uppercase tracking-widest block">
              CONTEXTO FUNDAMENTAL
            </span>
            <h2 className="text-base sm:text-xl font-bold text-white font-pixel">
              ¿Por qué existe la Matriz de Confusión?
            </h2>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Part 1: The Intuition - Simple Human Analogy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs mb-2">
            1
          </div>
          <h3 className="font-bold text-sm text-slate-200 mb-1.5">
            El Problema de la Certeza
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Una máquina (o Mario en el castillo) debe decidir en fracciones de segundo:{' '}
            <strong className="text-slate-200">¿Es amigo o enemigo?</strong> Nunca hay 100% de
            certeza, solo indicios y probabilidades.
          </p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl">
          <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs mb-2">
            2
          </div>
          <h3 className="font-bold text-sm text-slate-200 mb-1.5">
            Las Cosas Engañan
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Hay villanos que se disfrazan de personas buenas, y hay inocentes con aspecto raro.{' '}
            Por eso un clasificador <strong className="text-slate-200">SE CONFUNDE</strong>.
          </p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-2xl">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs mb-2">
            3
          </div>
          <h3 className="font-bold text-sm text-slate-200 mb-1.5">
            Dos Formas de Errar
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            No todas las equivocaciones son iguales: una es{' '}
            <strong className="text-amber-300">atacar al inocente (Falsa Alarma)</strong> y otra es{' '}
            <strong className="text-rose-300">dejar entrar al enemigo (Peligro ignorado)</strong>.
          </p>
        </div>
      </div>

      {/* Part 2: Hands-on Interactive Trial: "Tú Eres el Clasificador" */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-indigo-500/30 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <span className="font-pixel text-[10px] text-yellow-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              MINI-SIMULADOR: TÚ ERES EL CLASIFICADOR
            </span>
            <p className="text-xs text-slate-300">
              Caso {currentStep + 1} de {TEST_CHARACTERS.length}: Se acerca una criatura al portón.
            </p>
          </div>

          {/* Stepper buttons */}
          <div className="flex items-center gap-1.5">
            {TEST_CHARACTERS.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => setCurrentStep(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                  idx === currentStep
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                    : userDecisions[c.id]
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Character Card under evaluation */}
        <div className="flex flex-col md:flex-row items-center gap-5 p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0 border-2 shadow-lg ${activeChar.avatarBg}`}
          >
            {activeChar.avatar}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
              <h4 className="font-bold text-base text-white">{activeChar.name}</h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Sospecha del sensor: {activeChar.suspicionScore}%
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-1.5 leading-relaxed">
              {activeChar.appearance}
            </p>
            <div className="text-[11px] text-slate-400 font-mono">
              <strong>Pista visual:</strong> {activeChar.threatClues}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={() => handleMakeDecision('attack')}
              className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl border font-pixel text-[10px] transition-all flex items-center justify-center gap-2 ${
                decision === 'attack'
                  ? 'bg-red-600 border-red-400 text-white ring-2 ring-red-400'
                  : 'bg-red-950/80 hover:bg-red-900 border-red-500/50 text-red-200'
              }`}
            >
              <span>⚔️ ATACAR / PISAR</span>
            </button>
            <button
              onClick={() => handleMakeDecision('allow')}
              className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl border font-pixel text-[10px] transition-all flex items-center justify-center gap-2 ${
                decision === 'allow'
                  ? 'bg-sky-600 border-sky-400 text-white ring-2 ring-sky-400'
                  : 'bg-sky-950/80 hover:bg-sky-900 border-sky-500/50 text-sky-200'
              }`}
            >
              <span>🕊️ DEJAR PASAR</span>
            </button>
          </div>
        </div>

        {/* Immediate Result Insight Card */}
        {outcome && (
          <div className={`p-4 rounded-xl border ${outcome.bgColor} animate-fade-in`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-pixel ${outcome.badgeBg}`}>
                {outcome.type}
              </span>
              <span className={`font-bold text-xs sm:text-sm ${outcome.textColor}`}>
                {outcome.title}
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed mb-3">
              {outcome.desc}
            </p>

            <div className="flex justify-end">
              {currentStep < TEST_CHARACTERS.length - 1 ? (
                <button
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <span>Probar siguiente caso</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Has experimentado los 4 cuadrantes!</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Part 3: Why Accuracy is not enough (The Big Revelation) */}
      <div className="bg-slate-950/90 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col gap-3">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-pixel">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>LA GRAN PREGUNTA: ¿POR QUÉ NO BASTA CON MEDIR "CUÁNTAS VECES ACERTÉ"?</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Imagina que llegan <strong>100 criaturas</strong>: 99 son ciudadanos pacíficos (Toads) y
          solo <strong>1 es Bowser con una bomba</strong>.
        </p>
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed">
          Si Mario se duerme y simplemente predice siempre: <span className="text-sky-300 font-bold">"TODOS SON AMIGOS"</span>...
          ¡su <strong className="text-white">Exactitud (Accuracy) es del 99%</strong>!
          Sin embargo, el único enemigo entró y destruyó el reino.
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Por eso los científicos de datos crearon la <strong>Matriz de Confusión</strong>: no para
          ver un porcentaje vacío, sino para ver <strong className="text-white">exactamente si estás
          cometiendo Falsas Alarmas (Falsos Positivos) o dejando escapar Amenazas (Falsos Negativos)</strong>.
        </p>
      </div>

      {/* Footer / Call to action */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <span className="text-xs font-mono text-slate-400">
          ¿Listo para dominar la tabla y poner a prueba tus reflejos?
        </span>

        <div className="flex items-center gap-3">
          {onGoToGame && (
            <button
              onClick={onGoToGame}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-pixel text-xs flex items-center gap-2 shadow-lg shadow-red-950 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>JUGAR EN EL ARCADE</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
