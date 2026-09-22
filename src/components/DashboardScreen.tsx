/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DashboardStats, ThreatAssessment } from '../types';
import { 
  BarChart3, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Trash2, 
  Eye, 
  FileText, 
  Globe, 
  AlignLeft, 
  Search, 
  Filter, 
  TrendingUp,
  Activity,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';

interface DashboardScreenProps {
  stats: DashboardStats;
  onSelectScan: (scan: ThreatAssessment) => void;
  onDeleteScan: (id: string) => void;
  onNewScan: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  stats,
  onSelectScan,
  onDeleteScan,
  onNewScan,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');

  // Filter scan history
  const filteredScans = stats.recentScans.filter((scan) => {
    const matchesSearch = 
      scan.targetSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.riskLevel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.inputType.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterRisk === 'ALL') return matchesSearch;
    return matchesSearch && scan.riskLevel === filterRisk;
  });

  // Calculate signal frequency from user's own scans
  const signalFrequencyMap: Record<string, number> = {};
  stats.recentScans.forEach((scan) => {
    scan.signals.forEach((sig) => {
      const cat = sig.category.replace(/_/g, ' ');
      signalFrequencyMap[cat] = (signalFrequencyMap[cat] || 0) + 1;
    });
  });

  const signalFrequencyList = Object.entries(signalFrequencyMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Time-series data for chart
  const timeSeriesData = [...stats.recentScans]
    .reverse()
    .map((scan, idx) => ({
      index: `#${idx + 1}`,
      name: scan.targetSummary.substring(0, 16),
      score: scan.threatScore,
      risk: scan.riskLevel,
    }));

  // Risk Distribution Data
  const distributionData = [
    { name: 'Low (0-20)', count: stats.lowRiskScans, color: '#10b981' },
    { name: 'Moderate (21-60)', count: stats.moderateRiskScans, color: '#f59e0b' },
    { name: 'High/Critical (61-100)', count: stats.highRiskScans, color: '#ef4444' },
  ];

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-950/40 border-red-500/40';
      case 'HIGH':
        return 'text-orange-400 bg-orange-950/40 border-orange-500/40';
      case 'MODERATE':
        return 'text-amber-400 bg-amber-950/40 border-amber-500/40';
      case 'GUARDED':
        return 'text-sky-400 bg-sky-950/40 border-sky-500/40';
      case 'LOW':
      default:
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40';
    }
  };

  const getInputIcon = (type: string) => {
    switch (type) {
      case 'file':
        return <FileText className="w-3.5 h-3.5 text-cyan-400" />;
      case 'url':
        return <Globe className="w-3.5 h-3.5 text-cyan-400" />;
      case 'text':
      default:
        return <AlignLeft className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-100 uppercase">
              SECURITY AUDIT DASHBOARD
            </h1>
          </div>
          <p className="text-xs font-mono text-slate-400">
            Real-time telemetry and threat intelligence derived strictly from your submitted scans
          </p>
        </div>

        <button
          onClick={onNewScan}
          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono tracking-wider uppercase transition-all shadow-md self-start sm:self-auto"
        >
          + Inspect New Offer
        </button>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>TOTAL SCANS</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-slate-100 mt-2">
            {stats.totalScans}
          </p>
          <span className="text-[10px] font-mono text-slate-500">Evaluated sessions</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-red-900/30 backdrop-blur-sm">
          <div className="flex items-center justify-between text-red-400 text-xs font-mono">
            <span>HIGH/CRITICAL</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-red-400 mt-2">
            {stats.highRiskScans}
          </p>
          <span className="text-[10px] font-mono text-slate-500">Hazardous offers</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-900/30 backdrop-blur-sm">
          <div className="flex items-center justify-between text-amber-400 text-xs font-mono">
            <span>MODERATE RISK</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-amber-400 mt-2">
            {stats.moderateRiskScans}
          </p>
          <span className="text-[10px] font-mono text-slate-500">Required verification</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-900/30 backdrop-blur-sm">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-mono">
            <span>LOW RISK</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-emerald-400 mt-2">
            {stats.lowRiskScans}
          </p>
          <span className="text-[10px] font-mono text-slate-500">Compliant standards</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>AVG THREAT INDEX</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-cyan-300 mt-2">
            {stats.averageThreatScore}<span className="text-xs text-slate-500">/100</span>
          </p>
          <span className="text-[10px] font-mono text-slate-500">Portfolio baseline</span>
        </div>

      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Threat Score Trend Over Time */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold font-mono tracking-wide text-slate-100 uppercase">
                SCAM THREAT INDEX TREND
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Threat scores across chronological user scan history
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="h-60 w-full mt-4">
            {timeSeriesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeriesData}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="index" 
                    stroke="#475569" 
                    fontSize={11} 
                    fontFamily="monospace"
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    stroke="#475569" 
                    fontSize={11} 
                    fontFamily="monospace"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#090d16', 
                      borderColor: '#1e293b', 
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontFamily: 'monospace'
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#scoreGrad)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
                No scan data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Most Frequent Detected Fraud Signals */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold font-mono tracking-wide text-slate-100 uppercase">
                  FREQUENT RISK SIGNALS
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  Most recurring fraud indicators identified in your inspected items
                </p>
              </div>
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="space-y-3 mt-4">
              {signalFrequencyList.length > 0 ? (
                signalFrequencyList.map(({ name, count }) => {
                  const maxCount = signalFrequencyList[0]?.count || 1;
                  const percent = Math.round((count / maxCount) * 100);

                  return (
                    <div key={name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-300 font-semibold">{name}</span>
                        <span className="text-cyan-400 font-bold">{count} incident{count > 1 ? 's' : ''}</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                        <div 
                          className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs font-mono text-slate-500">
                  No signals detected in scan history.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>Aggregated strictly from your personal audits</span>
            <span className="text-cyan-400">Zero Global Fabrication</span>
          </div>
        </div>

      </div>

      {/* Recent Scan History Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 backdrop-blur-sm">
        
        {/* Table Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold font-mono tracking-wide text-slate-100 uppercase">
              SCAN AUDIT ARCHIVE
            </h3>
            <p className="text-xs text-slate-400">
              Select any past inspection to view its detailed security breakdown
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scans..."
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs font-mono">
              <Filter className="w-3 h-3 text-slate-500 ml-1" />
              {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilterRisk(lvl)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    filterRisk === lvl 
                      ? 'bg-cyan-500/20 text-cyan-300' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scans Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Target Summary</th>
                <th className="py-3 px-4 text-center">Threat Index</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredScans.length > 0 ? (
                filteredScans.map((scan) => (
                  <tr 
                    key={scan.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectScan(scan)}
                  >
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(scan.createdAt).toLocaleDateString()} {new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                        {getInputIcon(scan.inputType)}
                        <span className="capitalize">{scan.inputType}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-200 max-w-xs truncate">
                      {scan.targetSummary}
                    </td>

                    <td className="py-3 px-4 text-center font-bold font-mono">
                      <span className={scan.threatScore > 60 ? 'text-red-400' : scan.threatScore > 35 ? 'text-amber-400' : 'text-emerald-400'}>
                        {scan.threatScore}/100
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getRiskBadge(scan.riskLevel)}`}>
                        {scan.riskLevel}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectScan(scan)}
                          className="p-1.5 rounded hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 transition-colors"
                          title="Open Full Report"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteScan(scan.id)}
                          className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-red-400 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-mono">
                    No matching scan records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
