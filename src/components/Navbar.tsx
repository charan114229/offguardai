/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Activity, BarChart3, RotateCcw, AlertTriangle } from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'dashboard' | 'result';
  onNavigate: (view: 'home' | 'dashboard') => void;
  onSelectDemo: (demoKey: string) => void;
  isScanning: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onSelectDemo,
  isScanning,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#06080d]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Tagline */}
        <div 
          onClick={() => !isScanning && onNavigate('home')} 
          className="flex items-center gap-3 cursor-pointer group select-none"
          id="nav-brand"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-950 via-slate-900 to-indigo-950 border border-cyan-500/30 group-hover:border-cyan-400/60 transition-colors shadow-inner">
            <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-105 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-wider bg-gradient-to-r from-slate-100 via-cyan-100 to-slate-200 bg-clip-text text-transparent">
                OFFERGUARD<span className="text-cyan-400 ml-1">AI</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono tracking-wider text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 rounded">
                v2.4 SEC-OPS
              </span>
            </div>
            <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              Verify Before You Trust.
            </p>
          </div>
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Quick Demo Scenarios Selector */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono bg-slate-900/80 border border-slate-800 rounded-lg p-1">
            <span className="px-2 py-1 text-[11px] text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" />
              DEMO:
            </span>
            <button
              onClick={() => onSelectDemo('demo-fake-offer')}
              disabled={isScanning}
              id="demo-fake-btn"
              title="Test High-Risk Offer with Laptop Fee"
              className="px-2.5 py-1 rounded text-red-300 bg-red-950/40 hover:bg-red-900/50 border border-red-800/40 transition-colors disabled:opacity-50"
            >
              High-Risk Offer
            </button>
            <button
              onClick={() => onSelectDemo('demo-suspicious-url')}
              disabled={isScanning}
              id="demo-url-btn"
              title="Test Phishing URL on .top TLD"
              className="px-2.5 py-1 rounded text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/40 transition-colors disabled:opacity-50"
            >
              Phishing URL
            </button>
            <button
              onClick={() => onSelectDemo('demo-legitimate-offer')}
              disabled={isScanning}
              id="demo-legit-btn"
              title="Test Legitimate Enterprise Offer"
              className="px-2.5 py-1 rounded text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 transition-colors disabled:opacity-50"
            >
              Legitimate
            </button>
          </div>

          {/* Primary View Toggle */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => onNavigate('home')}
              disabled={isScanning}
              id="nav-home-btn"
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                currentView === 'home' || currentView === 'result'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Inspector</span>
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              disabled={isScanning}
              id="nav-dashboard-btn"
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                currentView === 'dashboard'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
