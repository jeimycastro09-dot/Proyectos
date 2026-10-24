import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/sound';
import { CheckCircle2, XCircle, Award, RotateCcw, HelpCircle, ArrowRight } from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  scenario: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    scenario:
      'Mario está de guardia. Un Goomba disfrazado de jardinero se acerca lentamente. Mario confía y lo deja pasar. El Goomba cruza el portón y ataca la bandera del castillo.',
    question: '¿Qué cuadrante de la matriz de confusión representa este suceso?',
    options: [
      'Verdadero Negativo (VN)',
      'Falso Negativo (FN) - Error Tipo II',
      'Falso Positivo (FP) - Error Tipo I',
      'Verdadero Positivo (VP)',
    ],
    correctIndex: 1,
    explanation:
      '¡Correcto! En la realidad era una amenaza (Positivo Real), pero Mario predijo que era inofensivo (Negativo). Un peligro real fue omitido: es un Falso Negativo (Error Tipo II).',
  },
  {
    id: 2,
    scenario:
      'Un pacífico Toad lleva un paraguas con forma de cono. Mario se asusta pensando que es un caparazón de pinchos hostil y salta sobre él para eliminarlo.',
    question: '¿Qué error cometió Mario en este caso?',
    options: [
      'Falso Positivo (FP) - Error Tipo I (Falsa Alarma)',
      'Falso Negativo (FN) - Error Tipo II',
      'Verdadero Positivo (VP)',
      'Especificidad Perfecta',
    ],
    correctIndex: 0,
    explanation:
      '¡Exacto! El Toad era inofensivo (Negativo Real), pero Mario predijo que era una amenaza (Positivo). Es una falsa alarma donde se castiga o rechaza a un inocente: Falso Positivo (Error Tipo I).',
  },
  {
    id: 3,
    scenario:
      'Mario pisó en total a 10 criaturas asegurando que todas eran villanos de Bowser. Al revisar, 8 eran realmente Goombas y 2 eran Toads inocentes que vestían sombreros raros.',
    question: '¿Cuál es la PRECISIÓN (Precision) de Mario?',
    options: ['80% (8 / 10)', '20% (2 / 10)', '100% (10 / 10)', '60% (8 - 2)'],
    correctIndex: 0,
    explanation:
      '¡Brillante! Precisión = VP / (VP + FP) = 8 / (8 + 2) = 8 / 10 = 80%. Mide qué porcentaje de los casos que Mario clasificó como amenaza eran realmente enemigos.',
  },
  {
    id: 4,
    scenario:
      'En el hospital del Reino Champiñón se diseña una IA para detectar una bacteria venenosa letal en los habitantes. Si una persona infectada no es detectada, fallece en 24 horas.',
    question: 'En este escenario médico de vida o muerte, ¿qué métrica debe ser máxima prioridad?',
    options: [
      'Recall / Sensibilidad (para tener mínimos Falsos Negativos)',
      'Especificidad (para rechazar Toads sanos)',
      'Solo la velocidad del procesador',
      'Ignorar la matriz y medir solo el tiempo',
    ],
    correctIndex: 0,
    explanation:
      '¡Así es! En diagnóstico de enfermedades mortales, un Falso Negativo (decirle al infectado que está sano) es fatal. Se busca Sensibilidad / Recall cercana al 100% para capturar todo caso positivo.',
  },
  {
    id: 5,
    scenario:
      'Un clasificador en un banco evalúa 10,000 transacciones diarias. Solo 10 de ellas son fraudes reales (el 99.9% son legítimas). El modelo simplemente predice "NO ES FRAUDE" para todas.',
    question: 'El modelo tiene una Exactitud (Accuracy) del 99.9%. ¿Por qué es un modelo inútil?',
    options: [
      'Porque su Recall de fraude es 0%: no detectó ni un solo fraude real.',
      'Porque la matriz de confusión solo se usa en videojuegos.',
      'Porque el 99.9% es un número impar.',
      'Porque los fraudes no son importantes para un banco.',
    ],
    correctIndex: 0,
    explanation:
      '¡Paradoja de la Exactitud! En clases altamente desbalanceadas, predecir siempre la clase mayoritaria da una exactitud altísima pero una Sensibilidad de 0%. ¡Por eso la Matriz de Confusión es esencial!',
  },
  {
    id: 6,
    scenario:
      'Queremos resumir la calidad del modelo de Mario en un único número que penalice severamente si Mario tiene muy mala Precisión O muy mal Recall.',
    question: '¿Qué métrica compuesta cumple esta función?',
    options: [
      'F1-Score (Media armónica entre Precisión y Recall)',
      'Promedio aritmético simple (Precision + Recall) / 2',
      'Suma de todos los Falsos Positivos',
      'Puntaje de vidas de Mario',
    ],
    correctIndex: 0,
    explanation:
      '¡Correcto! El F1-Score usa la media armónica: 2 * (P * R) / (P + R). Si cualquiera de las dos (Precisión o Recall) es muy baja, el F1-Score cae drásticamente.',
  },
];

export const GameQuiz: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = QUESTIONS[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.correctIndex;
    if (isCorrect) {
      setScore((s) => s + 1);
      sounds.playCoin();
    } else {
      sounds.playFalsePositive();
    }
  };

  const handleNext = () => {
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      if (score >= 4) {
        sounds.playVictory();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="bg-slate-900 border-2 border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col gap-5">
      {/* Quiz Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" />
          <h3 className="font-pixel text-xs sm:text-sm text-yellow-400">
            DESAFÍO DE MAESTRÍA DE DATOS
          </h3>
        </div>
        <div className="text-xs font-mono text-slate-400">
          Pregunta {currentIdx + 1} de {QUESTIONS.length}
        </div>
      </div>

      {!isFinished ? (
        <div className="flex flex-col gap-4">
          {/* Scenario box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] font-pixel text-indigo-400 block mb-1">
              ESCENARIO EN EL REINO:
            </span>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              "{currentQ.scenario}"
            </p>
          </div>

          {/* Question title */}
          <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
            {currentQ.question}
          </h4>

          {/* Options */}
          <div className="grid grid-cols-1 gap-2.5">
            {currentQ.options.map((opt, idx) => {
              let btnStyle = 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200';

              if (isAnswered) {
                if (idx === currentQ.correctIndex) {
                  btnStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-300 font-bold';
                } else if (idx === selectedOption) {
                  btnStyle = 'bg-rose-950/90 border-rose-500 text-rose-300';
                } else {
                  btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`p-3.5 rounded-xl border text-left text-xs sm:text-sm flex items-center justify-between transition-all active:scale-[0.99] ${btnStyle}`}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </span>
                  {isAnswered && idx === currentQ.correctIndex && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {isAnswered && idx === selectedOption && idx !== currentQ.correctIndex && (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation if answered */}
          {isAnswered && (
            <div
              className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed animate-fade-in ${
                selectedOption === currentQ.correctIndex
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
              }`}
            >
              <div className="font-bold font-pixel text-xs mb-1">
                {selectedOption === currentQ.correctIndex ? '¡CORRECTO!' : '¡RESPUESTA INCORRECTA!'}
              </div>
              <p className="font-sans text-xs text-slate-200">{currentQ.explanation}</p>

              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleNext}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-pixel text-xs flex items-center gap-2 shadow-lg shadow-indigo-950"
                >
                  <span>
                    {currentIdx < QUESTIONS.length - 1 ? 'SIGUIENTE PREGUNTA' : 'VER RESULTADOS'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Final Score Screen */
        <div className="py-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center mb-3">
            <Award className="w-8 h-8 text-yellow-400" />
          </div>
          <h3 className="font-pixel text-lg text-white mb-1">¡DESAFÍO COMPLETADO!</h3>
          <p className="text-xs text-slate-400 font-mono mb-4">
            Puntuación final: <strong className="text-yellow-400 text-base">{score}</strong> de{' '}
            {QUESTIONS.length} aciertos ({Math.round((score / QUESTIONS.length) * 100)}%)
          </p>

          <p className="text-xs text-slate-300 max-w-md leading-relaxed mb-6">
            {score === 6
              ? '🌟 ¡MAESTRO DE DATOS! Entiendes a la perfección la matriz de confusión, los Falsos Positivos/Negativos y sus implicaciones críticas.'
              : score >= 4
              ? '⭐ ¡Excelente trabajo! Dominas los conceptos fundamentales de clasificación y los compromisos de métricas.'
              : '👍 ¡Buen intento! Repasa la pestaña "Academia de la Matriz" y juega un par de rondas en el arcade para consolidar los conceptos.'}
          </p>

          <button
            onClick={handleRestart}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-pixel text-xs flex items-center gap-2 shadow-lg shadow-indigo-950"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REINTENTAR QUIZ</span>
          </button>
        </div>
      )}
    </div>
  );
};
