/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  Globe, 
  AlignLeft, 
  Shield, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  FileCheck2,
  Lock,
  Radio,
  ExternalLink
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { UploadFileModal } from './components/UploadFileModal';
import { UploadUrlModal } from './components/UploadUrlModal';
import { PasteTextModal } from './components/PasteTextModal';
import { ScanProgress } from './components/ScanProgress';
import { ResultScreen } from './components/ResultScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { Toast, ToastMessage } from './components/Toast';
import { DashboardStats, ThreatAssessment } from './types';

export function App() {
  const [currentView, setCurrentView] = useState<'home' | 'scanning' | 'result' | 'dashboard'>('home');
  const [scanningInputType, setScanningInputType] = useState<'file' | 'url' | 'text'>('text');
  const [currentAssessment, setCurrentAssessment] = useState<ThreatAssessment | null>(null);
  const [activeModal, setActiveModal] = useState<'file' | 'url' | 'text' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [stats, setStats] = useState<DashboardStats>({
    totalScans: 0,
    highRiskScans: 0,
    moderateRiskScans: 0,
    lowRiskScans: 0,
    averageThreatScore: 0,
    recentScans: [],
  });

  // Fetch initial dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load dashboard telemetry:', err);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const showToast = (type: 'error' | 'success' | 'info', message: string) => {
    setToast({
      id: Date.now().toString(),
      type,
      message,
    });
  };

  // 1. Analyze File Handler
  const handleAnalyzeFile = async (fileData: { name: string; type: string; base64: string; size: number }) => {
    setIsSubmitting(true);
    setActiveModal(null);
    setScanningInputType('file');
    setCurrentView('scanning');

    try {
      const res = await fetch('/api/analyze/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: fileData.name,
          fileType: fileData.type,
          fileBase64: fileData.base64,
          fileSize: fileData.size,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'File analysis failed.');
      }

      // Small delay so user perceives the multi-stage security pipeline
      setTimeout(() => {
        setCurrentAssessment(data);
        setCurrentView('result');
        setIsSubmitting(false);
        fetchDashboardStats();
        showToast('success', 'Document inspection complete.');
      }, 1400);
    } catch (err: any) {
      setIsSubmitting(false);
      setCurrentView('home');
      showToast('error', err.message || 'Inspection failed. Please retry.');
    }
  };

  // 2. Analyze URL Handler
  const handleAnalyzeUrl = async (url: string) => {
    setIsSubmitting(true);
    setActiveModal(null);
    setScanningInputType('url');
    setCurrentView('scanning');

    try {
      const res = await fetch('/api/analyze/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'URL analysis failed.');
      }

      setTimeout(() => {
        setCurrentAssessment(data);
        setCurrentView('result');
        setIsSubmitting(false);
        fetchDashboardStats();
        showToast('success', 'URL security inspection complete.');
      }, 1400);
    } catch (err: any) {
      setIsSubmitting(false);
      setCurrentView('home');
      showToast('error', err.message || 'URL inspection failed. Please check the URL.');
    }
  };

  // 3. Analyze Text Handler
  const handleAnalyzeText = async (text: string) => {
    setIsSubmitting(true);
    setActiveModal(null);
    setScanningInputType('text');
    setCurrentView('scanning');

    try {
      const res = await fetch('/api/analyze/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Text analysis failed.');
      }

      setTimeout(() => {
        setCurrentAssessment(data);
        setCurrentView('result');
        setIsSubmitting(false);
        fetchDashboardStats();
        showToast('success', 'Offer content inspection complete.');
      }, 1400);
    } catch (err: any) {
      setIsSubmitting(false);
      setCurrentView('home');
      showToast('error', err.message || 'Analysis failed. Please check your text.');
    }
  };

  // Quick Demo Scenario Selection
  const handleSelectDemo = async (demoKey: string) => {
    setIsSubmitting(true);
    setScanningInputType(demoKey.includes('url') ? 'url' : demoKey.includes('file') ? 'file' : 'text');
    setCurrentView('scanning');

    try {
      const res = await fetch(`/api/demo/${demoKey}`);
      if (!res.ok) {
        throw new Error('Demo scenario could not be loaded.');
      }
      const data = await res.json();

      setTimeout(() => {
        setCurrentAssessment(data);
        setCurrentView('result');
        setIsSubmitting(false);
        showToast('info', 'Loaded reference demo scenario.');
      }, 1200);
    } catch (err: any) {
      setIsSubmitting(false);
      setCurrentView('home');
      showToast('error', err.message || 'Failed to load demo scenario.');
    }
  };

  // Delete Scan Handler in Dashboard
  const handleDeleteScan = async (id: string) => {
    try {
      const res = await fetch(`/api/scans/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('success', 'Scan record deleted.');
        fetchDashboardStats();
      } else {
        showToast('error', 'Could not delete scan record.');
      }
    } catch {
      showToast('error', 'Network error while deleting scan record.');
    }
  };

  return (
    <div className="min-h-screen bg-[#04060a] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Application Navbar */}
      <Navbar
        currentView={currentView === 'scanning' ? 'home' : currentView}
        onNavigate={(view) => setCurrentView(view)}
        onSelectDemo={handleSelectDemo}
        isScanning={isSubmitting}
      />

      {/* Main App Body */}
      <main className="flex-1 flex flex-col">
        
        {/* VIEW 1: SCAN PROGRESS IN FLIGHT */}
        {currentView === 'scanning' && (
          <div className="flex-1 flex items-center justify-center py-12">
            <ScanProgress inputType={scanningInputType} />
          </div>
        )}

        {/* VIEW 2: FULL THREAT ASSESSMENT RESULT */}
        {currentView === 'result' && currentAssessment && (
          <ResultScreen
            assessment={currentAssessment}
            onNewScan={() => setCurrentView('home')}
            onViewDashboard={() => setCurrentView('dashboard')}
          />
        )}

        {/* VIEW 3: AUDIT DASHBOARD */}
        {currentView === 'dashboard' && (
          <DashboardScreen
            stats={stats}
            onSelectScan={(scan) => {
              setCurrentAssessment(scan);
              setCurrentView('result');
            }}
            onDeleteScan={handleDeleteScan}
            onNewScan={() => setCurrentView('home')}
          />
        )}

        {/* VIEW 4: MINIMAL, FOCUSED HOME SCREEN (EXACTLY 3 PRIMARY ACTIONS) */}
        {currentView === 'home' && (
          <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
            
            {/* Focused Hero Header */}
            <div className="text-center space-y-4 mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>AI RECRUITMENT FRAUD & PHISHING INSPECTOR</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight bg-gradient-to-b from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent uppercase">
                VERIFY BEFORE YOU TRUST.
              </h1>

              <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 font-sans leading-relaxed">
                Analyze suspicious job offers, recruitment messages, documents and URLs with AI-powered security intelligence.
              </p>

              {/* 1-Click Competition Judge Demo Row */}
              <div className="pt-2 flex items-center justify-center gap-2 flex-wrap text-xs font-mono">
                <span className="text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  DEMO EVALUATIONS:
                </span>
                <button
                  onClick={() => handleSelectDemo('demo-fake-offer')}
                  className="px-2.5 py-1 rounded bg-red-950/40 hover:bg-red-900/50 border border-red-800/40 text-red-300 transition-colors"
                >
                  Fake Offer (₹8,499 Deposit)
                </button>
                <button
                  onClick={() => handleSelectDemo('demo-suspicious-url')}
                  className="px-2.5 py-1 rounded bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/40 text-amber-300 transition-colors"
                >
                  Suspicious Portal (.top)
                </button>
                <button
                  onClick={() => handleSelectDemo('demo-legitimate-offer')}
                  className="px-2.5 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 text-emerald-300 transition-colors"
                >
                  Legitimate Enterprise Offer
                </button>
              </div>
            </div>

            {/* THE THREE PRIMARY ACTIONS (Clean, focused 3-card grid) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* PRIMARY ACTION 1: UPLOAD FILE */}
              <div 
                className="group relative rounded-2xl bg-gradient-to-b from-slate-900/80 to-[#090d16]/90 border border-slate-800/90 hover:border-cyan-500/60 p-6 sm:p-7 transition-all duration-300 shadow-xl hover:shadow-cyan-950/20 flex flex-col justify-between"
                id="action-card-file"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:border-cyan-500/40 transition-all mb-5">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold font-mono tracking-wide text-slate-100 uppercase mb-2">
                    UPLOAD FILE
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                    Analyze a suspicious offer letter, PDF, screenshot or image.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60">
                  <button
                    onClick={() => setActiveModal('file')}
                    id="home-upload-file-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 group-hover:bg-cyan-500 text-cyan-300 group-hover:text-slate-950 font-mono font-bold text-xs tracking-wider uppercase border border-cyan-500/30 group-hover:border-cyan-400 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>UPLOAD FILE</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* PRIMARY ACTION 2: UPLOAD URL */}
              <div 
                className="group relative rounded-2xl bg-gradient-to-b from-slate-900/80 to-[#090d16]/90 border border-slate-800/90 hover:border-cyan-500/60 p-6 sm:p-7 transition-all duration-300 shadow-xl hover:shadow-cyan-950/20 flex flex-col justify-between"
                id="action-card-url"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:border-cyan-500/40 transition-all mb-5">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold font-mono tracking-wide text-slate-100 uppercase mb-2">
                    UPLOAD URL
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                    Inspect a suspicious recruitment or company URL.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60">
                  <button
                    onClick={() => setActiveModal('url')}
                    id="home-upload-url-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 group-hover:bg-cyan-500 text-cyan-300 group-hover:text-slate-950 font-mono font-bold text-xs tracking-wider uppercase border border-cyan-500/30 group-hover:border-cyan-400 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>ANALYZE URL</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* PRIMARY ACTION 3: PASTE TEXT */}
              <div 
                className="group relative rounded-2xl bg-gradient-to-b from-slate-900/80 to-[#090d16]/90 border border-slate-800/90 hover:border-cyan-500/60 p-6 sm:p-7 transition-all duration-300 shadow-xl hover:shadow-cyan-950/20 flex flex-col justify-between"
                id="action-card-text"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:scale-105 group-hover:border-cyan-500/40 transition-all mb-5">
                    <AlignLeft className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold font-mono tracking-wide text-slate-100 uppercase mb-2">
                    PASTE TEXT
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                    Paste a recruiter message, job offer or appointment letter.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60">
                  <button
                    onClick={() => setActiveModal('text')}
                    id="home-paste-text-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 group-hover:bg-cyan-500 text-cyan-300 group-hover:text-slate-950 font-mono font-bold text-xs tracking-wider uppercase border border-cyan-500/30 group-hover:border-cyan-400 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>ANALYZE TEXT</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

            </div>

            {/* Privacy & Safeguard Footer Bar */}
            <div className="mt-12 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
              <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>
                Privacy Protocol: Do not upload passwords, OTPs, or payment-card credentials. All evaluations execute securely server-side.
              </span>
            </div>

          </div>
        )}

      </main>

      {/* Action Modals */}
      <UploadFileModal
        isOpen={activeModal === 'file'}
        onClose={() => setActiveModal(null)}
        onSubmit={handleAnalyzeFile}
        isLoading={isSubmitting}
      />

      <UploadUrlModal
        isOpen={activeModal === 'url'}
        onClose={() => setActiveModal(null)}
        onSubmit={handleAnalyzeUrl}
        isLoading={isSubmitting}
      />

      <PasteTextModal
        isOpen={activeModal === 'text'}
        onClose={() => setActiveModal(null)}
        onSubmit={handleAnalyzeText}
        isLoading={isSubmitting}
      />

      {/* Global Toast Alert */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 py-4 px-4 sm:px-6 lg:px-8 bg-[#04060a]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>OFFERGUARD AI Security Engine • 0-Trust Evaluation</span>
          </div>
          <div>
            <span>Powered by Gemini 2.5 Server-Side Analysis & Deterministic Scoring Engine</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
