import React from 'react';
import { GameLogEntry } from '../types/game';
import { History, CheckCircle2, AlertOctagon, ShieldAlert, HeartHandshake } from 'lucide-react';

interface ClassificationHistoryProps {
  logs: GameLogEntry[];
}

export const ClassificationHistory: React.FC<ClassificationHistoryProps> = ({ logs }) => {
  return (
    <div className="bg-slate-900 border-2 border-slate-700/80 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-slate-400" />
          <h3 className="font-pixel text-xs text-slate-300 uppercase tracking-wider">
            REGISTRO DE CLASIFICACIONES DE MARIO
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          Últimas decisiones
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500 font-mono">
          Aún no se han evaluado criaturas. ¡Inicia una partida o juega para ver el registro!
        </div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {logs.slice(-8).reverse().map((log) => {
            let badgeStyle = '';
            let icon = null;

            switch (log.result) {
              case 'TP':
                badgeStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
                break;
              case 'TN':
                badgeStyle = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
                icon = <HeartHandshake className="w-3.5 h-3.5 text-sky-400" />;
                break;
              case 'FP':
                badgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
                icon = <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />;
                break;
              case 'FN':
                badgeStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                icon = <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
                break;
            }

            return (
              <div
                key={log.id}
                className="bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`px-2 py-0.5 rounded-md border text-[10px] font-pixel font-bold flex items-center gap-1 shrink-0 ${badgeStyle}`}
                  >
                    {icon}
                    <span>{log.result}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-200 truncate">{log.entityName}</div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">{log.reason}</div>
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono text-[10px]">
                  <span className="text-slate-400">Predicción: </span>
                  <span className={log.predictedThreat ? 'text-rose-400' : 'text-sky-400'}>
                    {log.predictedThreat ? 'Amenaza' : 'Inocente'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
