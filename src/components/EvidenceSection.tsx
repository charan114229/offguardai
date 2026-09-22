/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RiskSignal, SignalSeverity } from '../types';
import { ShieldAlert, Quote, ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';

interface EvidenceSectionProps {
  signals: RiskSignal[];
}

export const EvidenceSection: React.FC<EvidenceSectionProps> = ({ signals }) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [expandedSignalId, setExpandedSignalId] = useState<string | null>(null);

  const filteredSignals = signals.filter((s) => {
    if (filterSeverity === 'ALL') return true;
    return s.severity === filterSeverity;
  });

  const getSeverityBadge = (severity: SignalSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-950/50 border-red-500/50';
      case 'HIGH':
        return 'text-orange-400 bg-orange-950/50 border-orange-500/50';
      case 'MEDIUM':
        return 'text-amber-400 bg-amber-950/50 border-amber-500/50';
      case 'LOW':
      default:
        return 'text-emerald-400 bg-emerald-950/50 border-emerald-500/50';
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedSignalId(expandedSignalId === id ? null : id);
  };

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 backdrop-blur-sm">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold font-mono tracking-wide text-slate-100 uppercase">
              WHY THIS WAS FLAGGED
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Verifiable evidence extracted directly from the submitted content
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-[11px] text-slate-500 mr-1">Filter:</span>
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                filterSeverity === sev
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Signals List */}
      {filteredSignals.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800 text-slate-400">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
          <p className="text-sm font-semibold text-slate-300">No signals matching this severity.</p>
          <p className="text-xs text-slate-500 mt-1">The submitted content did not trigger flags under the current filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSignals.map((signal) => {
            const isExpanded = expandedSignalId === signal.id;
            const isSevere = signal.severity === 'CRITICAL' || signal.severity === 'HIGH';

            return (
              <div
                key={signal.id}
                className={`rounded-xl border transition-all ${
                  isSevere 
                    ? 'border-red-900/30 bg-slate-950/80 hover:border-red-800/50' 
                    : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                }`}
              >
                {/* Header bar */}
                <div 
                  onClick={() => toggleExpand(signal.id)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getSeverityBadge(signal.severity)}`}>
                      {signal.severity}
                    </span>
                    <div>
                      <div className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                        {signal.category.replace(/_/g, ' ')}
                      </div>
                      <h4 className="text-sm font-semibold text-slate-100 mt-0.5">
                        {signal.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400">
                      Confidence: <strong className="text-slate-200">{signal.confidence}%</strong>
                    </span>
                    <button className="text-slate-400 hover:text-slate-200 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Body Content */}
                <div className="px-4 pb-4 space-y-3 pt-1 border-t border-slate-800/50">
                  {/* Evidence quote */}
                  <div className="rounded-lg bg-[#060910] border border-slate-800 p-3 relative">
                    <div className="flex items-start gap-2.5">
                      <Quote className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div className="text-xs font-mono text-slate-200 leading-relaxed italic break-words">
                        "{signal.evidence}"
                      </div>
                    </div>
                  </div>

                  {/* Security Explanation */}
                  <div className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-200 font-mono text-[11px] uppercase mr-1.5">
                        Security Explanation:
                      </span>
                      <span className="text-slate-300 font-sans leading-relaxed">
                        {signal.explanation}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
