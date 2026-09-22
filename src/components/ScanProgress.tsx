/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle2, Loader2, Binary } from 'lucide-react';

interface ScanProgressProps {
  inputType: 'file' | 'url' | 'text';
}

const SCAN_STEPS = [
  'INITIALIZING SECURITY ENGINE',
  'EXTRACTING INFORMATION',
  'ANALYZING CONTENT',
  'CHECKING PAYMENT INDICATORS',
  'ANALYZING PHISHING SIGNALS',
  'EVALUATING IMPERSONATION RISK',
  'CORRELATING THREAT SIGNALS',
  'CALCULATING THREAT INDEX',
  'GENERATING SECURITY REPORT',
];

export const ScanProgress: React.FC<ScanProgressProps> = ({ inputType }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < SCAN_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    return () => clearInterval(interval);
  }, []);

  const progressPercent = Math.round(((currentStepIndex + 1) / SCAN_STEPS.length) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="relative rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-8 shadow-2xl backdrop-blur-xl overflow-hidden">
        
        {/* Animated Scanning Laser Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

        {/* Header telemetry */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-500/40">
              <Shield className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">
                OFFERGUARD THREAT ENGINE
              </h2>
              <p className="text-xs font-mono text-cyan-400">
                ACTIVE PIPELINE • {inputType.toUpperCase()} INSPECTION
              </p>
            </div>
          </div>
          <div className="text-right font-mono">
            <span className="text-2xl font-black text-cyan-300">{progressPercent}%</span>
            <p className="text-[10px] text-slate-400 uppercase">COMPLETION</p>
          </div>
        </div>

        {/* Current Active Step Callout */}
        <div className="my-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-xs font-mono text-cyan-300 mb-4 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span>PROCESSING STAGE {currentStepIndex + 1} OF {SCAN_STEPS.length}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-slate-100">
            {SCAN_STEPS[currentStepIndex]}...
          </h3>
          <p className="text-xs text-slate-400 mt-2 font-mono">
            Correlating syntactic, structural, and behavioral markers against recruitment fraud signatures.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800 mb-6">
          <div 
            className="bg-gradient-to-r from-cyan-600 via-cyan-400 to-indigo-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step List / Monospace Telemetry */}
        <div className="space-y-1.5 font-mono text-xs max-h-48 overflow-y-auto pr-2">
          {SCAN_STEPS.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div 
                key={step} 
                className={`flex items-center justify-between p-1.5 rounded transition-colors ${
                  isCurrent 
                    ? 'bg-cyan-950/40 text-cyan-200 border border-cyan-800/40' 
                    : isCompleted 
                    ? 'text-slate-400' 
                    : 'text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
                  ) : (
                    <Binary className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                  )}
                  <span className={isCurrent ? 'font-bold' : ''}>{step}</span>
                </div>
                <span className="text-[10px] tracking-widest uppercase">
                  {isCompleted ? 'VERIFIED' : isCurrent ? 'RUNNING' : 'PENDING'}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
