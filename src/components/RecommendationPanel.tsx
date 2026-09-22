/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, AlertOctagon, CheckSquare, ExternalLink } from 'lucide-react';
import { RiskLevel } from '../types';

interface RecommendationPanelProps {
  recommendations: string[];
  riskLevel: RiskLevel;
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
  recommendations,
  riskLevel,
}) => {
  const isHighRisk = riskLevel === 'CRITICAL' || riskLevel === 'HIGH';

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          {isHighRisk ? (
            <AlertOctagon className="w-5 h-5 text-red-400" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          )}
          <h3 className="text-base font-bold font-mono tracking-wide text-slate-100 uppercase">
            WHAT YOU SHOULD DO NEXT
          </h3>
        </div>
        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 rounded">
          DYNAMIC DEFENSE ACTIONS
        </span>
      </div>

      <div className="space-y-2.5">
        {recommendations.map((rec, index) => {
          const isCriticalWarning = rec.toLowerCase().includes('do not') || rec.toLowerCase().includes('cease') || rec.toLowerCase().includes('report');
          return (
            <div
              key={index}
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                isCriticalWarning
                  ? 'border-red-900/30 bg-red-950/20 text-red-200'
                  : 'border-slate-800/80 bg-slate-950/50 text-slate-200'
              }`}
            >
              <div className="mt-0.5 p-1 rounded bg-slate-900 border border-slate-800 shrink-0">
                <CheckSquare className={`w-3.5 h-3.5 ${isCriticalWarning ? 'text-red-400' : 'text-cyan-400'}`} />
              </div>
              <p className="text-xs sm:text-sm font-sans leading-relaxed">
                {rec}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
