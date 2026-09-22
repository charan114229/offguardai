/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Globe, Link2, X, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';

interface UploadUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export const UploadUrlModal: React.FC<UploadUrlModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [url, setUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleValidateAndSubmit = () => {
    setErrorMsg(null);
    const trimmed = url.trim();

    if (!trimmed) {
      setErrorMsg('Please enter or paste a recruitment URL to inspect.');
      return;
    }

    try {
      const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      if (!parsed.hostname.includes('.')) {
        setErrorMsg('Please enter a fully-qualified domain name (e.g., https://example.com/jobs).');
        return;
      }
      onSubmit(parsed.href);
    } catch {
      setErrorMsg('Invalid URL syntax. Please ensure the link is properly formatted.');
    }
  };

  const loadSampleUrl = () => {
    setUrl('https://careers-google-verify.biz-careers.top/onboard/portal');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#090d16] border border-cyan-500/40 p-6 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-mono tracking-wide">
                RECRUITMENT URL INSPECTION
              </h3>
              <p className="text-xs text-slate-400">
                Inspect suspicious career sites, onboarding forms, and recruitment links
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* URL Input Form */}
        <div className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono font-medium text-slate-300">
                TARGET WEB ADDRESS (URL)
              </label>
              <button
                type="button"
                onClick={loadSampleUrl}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
              >
                <Sparkles className="w-3 h-3" />
                <span>Load Sample URL</span>
              </button>
            </div>

            <div className="relative flex items-center">
              <div className="absolute left-3 text-slate-500">
                <Link2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleValidateAndSubmit();
                }}
                placeholder="https://company-careers-login.example.com/apply"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60 font-mono"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Observable Inspection Highlights */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3.5 space-y-2 text-xs font-mono text-slate-400">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              INSPECTION PROTOCOLS:
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
              <li>Structural observable verification (HTTPS, TLD risk, domain depth)</li>
              <li>Brand impersonation and typosquatting heuristic pattern check</li>
              <li>Strict sandbox rule: Target URLs are never loaded directly in your browser</li>
            </ul>
          </div>

          {/* Privacy Notice */}
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>Safe Inspection:</strong> External domain intelligence is evaluated passively without visiting or executing untrusted code on your device.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleValidateAndSubmit}
            disabled={!url.trim() || isLoading}
            id="analyze-url-submit-btn"
            className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-md hover:shadow-cyan-500/20 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            <span>{isLoading ? 'Inspecting...' : 'Analyze URL'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
