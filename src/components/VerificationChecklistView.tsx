/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { VerificationTask } from '../types';
import { ListChecks, CheckCircle2, Circle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface VerificationChecklistViewProps {
  tasks: VerificationTask[];
}

export const VerificationChecklistView: React.FC<VerificationChecklistViewProps> = ({ tasks }) => {
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  const toggleTask = (id: string) => {
    setCompletedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const completedCount = tasks.filter((t) => completedMap[t.id]).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const getPriorityBadge = (priority: 'CRITICAL' | 'RECOMMENDED' | 'ADVISORY') => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-950/40 border-red-500/40';
      case 'RECOMMENDED':
        return 'text-amber-400 bg-amber-950/40 border-amber-500/40';
      case 'ADVISORY':
      default:
        return 'text-cyan-400 bg-cyan-950/40 border-cyan-500/40';
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-base font-bold font-mono tracking-wide text-slate-100 uppercase">
              CANDIDATE INDEPENDENT VERIFICATION CHECKLIST
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Conduct independent due diligence before accepting offers or submitting documentation
            </p>
          </div>
        </div>

        {/* Verification Progress Counter */}
        <div className="flex items-center gap-2.5 font-mono text-xs text-slate-300">
          <span className="text-cyan-400 font-bold">{completedCount}/{tasks.length}</span>
          <span>Verified</span>
          <div className="w-20 bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div 
              className="bg-cyan-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => {
          const isDone = !!completedMap[task.id];

          return (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3.5 ${
                isDone
                  ? 'border-emerald-800/50 bg-emerald-950/20 text-slate-300'
                  : 'border-slate-800/80 bg-slate-950/60 hover:border-slate-700/90 text-slate-200'
              }`}
            >
              <button 
                type="button"
                className="mt-0.5 text-slate-400 hover:text-cyan-400 transition-colors shrink-0"
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs sm:text-sm font-semibold font-mono ${isDone ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                    {task.title}
                  </h4>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <p className={`text-xs mt-1 leading-relaxed ${isDone ? 'text-slate-500' : 'text-slate-400'}`}>
                  {task.instruction}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {progressPercent === 100 && (
        <div className="mt-4 p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>All independent due diligence checks completed! You have systematically verified this opportunity.</span>
        </div>
      )}
    </div>
  );
};
