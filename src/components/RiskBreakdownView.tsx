/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DimensionRisk, RiskBreakdown, SignalSeverity } from '../types';
import { 
  CreditCard, 
  Fish, 
  UserX, 
  Clock, 
  Key, 
  Link, 
  Globe2, 
  Users 
} from 'lucide-react';

interface RiskBreakdownViewProps {
  breakdown: RiskBreakdown;
}

interface DimensionConfig {
  key: keyof RiskBreakdown;
  label: string;
  icon: React.ElementType;
}

const DIMENSIONS: DimensionConfig[] = [
  { key: 'paymentRisk', label: 'Payment Risk', icon: CreditCard },
  { key: 'phishingRisk', label: 'Phishing Risk', icon: Fish },
  { key: 'impersonationRisk', label: 'Impersonation Risk', icon: UserX },
  { key: 'urgencyRisk', label: 'Urgency Risk', icon: Clock },
  { key: 'credentialRisk', label: 'Credential Risk', icon: Key },
  { key: 'urlRisk', label: 'URL Risk', icon: Link },
  { key: 'domainRisk', label: 'Domain Risk', icon: Globe2 },
  { key: 'socialEngineeringRisk', label: 'Social Engineering', icon: Users },
];

export const RiskBreakdownView: React.FC<RiskBreakdownViewProps> = ({ breakdown }) => {
  const getSeverityBadge = (severity: SignalSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-950/40 border-red-500/40';
      case 'HIGH':
        return 'text-orange-400 bg-orange-950/40 border-orange-500/40';
      case 'MEDIUM':
        return 'text-amber-400 bg-amber-950/40 border-amber-500/40';
      case 'LOW':
      default:
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40';
    }
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 60) return 'bg-orange-500';
    if (score >= 35) return 'bg-amber-500';
    if (score >= 20) return 'bg-cyan-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-base font-bold font-mono tracking-wide text-slate-100 uppercase">
            RISK BREAKDOWN MATRIX
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            Multidimensional evaluation normalized from detected fraud signals
          </p>
        </div>
        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 rounded">
          8 DIMENSIONS EVALUATED
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DIMENSIONS.map(({ key, label, icon: Icon }) => {
          const dim: DimensionRisk = breakdown[key] || { score: 0, severity: 'LOW', explanation: 'No anomalies detected.' };
          return (
            <div 
              key={key}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                      <Icon className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <span className="text-xs font-bold font-mono text-slate-200">
                      {label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {dim.score}/100
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${getSeverityBadge(dim.severity)}`}>
                      {dim.severity}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden mb-2">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${getBarColor(dim.score)}`}
                    style={{ width: `${Math.min(100, Math.max(2, dim.score))}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed font-sans line-clamp-2">
                {dim.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
