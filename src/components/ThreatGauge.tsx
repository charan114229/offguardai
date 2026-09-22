/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { RiskLevel } from '../types';
import { ShieldAlert, ShieldCheck, AlertTriangle, Shield } from 'lucide-react';

interface ThreatGaugeProps {
  score: number; // 0 - 100
  riskLevel: RiskLevel;
  confidence: number;
}

export const ThreatGauge: React.FC<ThreatGaugeProps> = ({ score, riskLevel, confidence }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * score);
      setAnimatedScore(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  // Color mappings
  const getColor = (lvl: RiskLevel) => {
    switch (lvl) {
      case 'CRITICAL':
        return {
          stroke: '#ef4444',
          glow: 'rgba(239, 68, 68, 0.4)',
          text: 'text-red-400',
          bg: 'bg-red-950/40',
          border: 'border-red-500/40',
          badgeText: 'CRITICAL THREAT',
        };
      case 'HIGH':
        return {
          stroke: '#f97316',
          glow: 'rgba(249, 115, 22, 0.4)',
          text: 'text-orange-400',
          bg: 'bg-orange-950/40',
          border: 'border-orange-500/40',
          badgeText: 'HIGH RISK',
        };
      case 'MODERATE':
        return {
          stroke: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.35)',
          text: 'text-amber-400',
          bg: 'bg-amber-950/40',
          border: 'border-amber-500/40',
          badgeText: 'MODERATE RISK',
        };
      case 'GUARDED':
        return {
          stroke: '#38bdf8',
          glow: 'rgba(56, 189, 248, 0.35)',
          text: 'text-sky-400',
          bg: 'bg-sky-950/40',
          border: 'border-sky-500/40',
          badgeText: 'GUARDED',
        };
      case 'LOW':
      default:
        return {
          stroke: '#10b981',
          glow: 'rgba(16, 185, 129, 0.35)',
          text: 'text-emerald-400',
          bg: 'bg-emerald-950/40',
          border: 'border-emerald-500/40',
          badgeText: 'LOW RISK / VERIFIED',
        };
    }
  };

  const colors = getColor(riskLevel);

  // SVG Gauge calculations (240 degree arc)
  const radius = 80;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  // Use a 240-degree open gauge at the bottom
  const arcLength = circumference * (240 / 360);
  const strokeDashoffset = arcLength - (arcLength * (animatedScore / 100));

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm relative overflow-hidden">
      {/* Ambient background glow */}
      <div 
        className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors"
        style={{ backgroundColor: colors.stroke }}
      />

      <div className="text-[11px] font-mono tracking-widest text-slate-400 uppercase mb-2 flex items-center gap-1.5">
        <Shield className="w-3.5 h-3.5 text-cyan-400" />
        Scam Threat Index
      </div>

      {/* Radial Gauge SVG */}
      <div className="relative w-52 h-44 flex items-center justify-center">
        <svg className="w-52 h-52 -rotate-[210deg] transform" viewBox="0 0 200 200">
          {/* Background track arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Active colored arc with glow */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 8px ${colors.glow})`,
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>

        {/* Inner Score Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <div className="flex items-baseline">
            <span className={`text-5xl font-black font-mono tracking-tight ${colors.text}`}>
              {animatedScore}
            </span>
            <span className="text-slate-500 text-sm font-mono ml-1 font-semibold">/100</span>
          </div>

          {/* Status Badge */}
          <div className={`mt-2 px-3 py-0.5 rounded-full border text-[11px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 ${colors.bg} ${colors.border} ${colors.text}`}>
            {riskLevel === 'CRITICAL' || riskLevel === 'HIGH' ? (
              <ShieldAlert className="w-3 h-3" />
            ) : riskLevel === 'MODERATE' ? (
              <AlertTriangle className="w-3 h-3" />
            ) : (
              <ShieldCheck className="w-3 h-3" />
            )}
            <span>{colors.badgeText}</span>
          </div>
        </div>
      </div>

      {/* Confidence & Telemetry footer */}
      <div className="w-full mt-2 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
        <div>
          <span>Model Confidence: </span>
          <span className="text-slate-200 font-bold">{confidence}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-slate-300">Deterministic Correlated</span>
        </div>
      </div>
    </div>
  );
};
