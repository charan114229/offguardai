/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlignLeft, X, AlertCircle, ShieldAlert, Sparkles, FileCheck2 } from 'lucide-react';

interface PasteTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

const SAMPLE_SCAM_TEXT = `OFFICIAL APPOINTMENT LETTER - TECHCORP GLOBAL SOLUTIONS
Dear Candidate,
Congratulations! Based on your profile review, you have been selected for the position of Senior Remote Cloud Engineer at TechCorp Global.
Salary Package: ₹38,00,000 per annum + ₹2,00,000 joining bonus.
Work Location: Remote / Home Office.

MANDATORY ONBOARDING INSTRUCTION:
To facilitate the dispatch of your dedicated company Apple MacBook Pro and encrypted security tokens, you are required to submit a refundable equipment security deposit of ₹8,499.
Please transfer ₹8,499 via UPI to: techcorp-desk@oksbi within 24 hours of receiving this letter.
This deposit is 100% refundable with your first monthly payroll.

Contact HR Director Ananya Sharma on Telegram: t.me/techcorp_onboarding or email techcorp.recruitment.hr@gmail.com with your deposit receipt.
Note: Offer expires in 24 hours if payment confirmation is not received.`;

const SAMPLE_LEGIT_TEXT = `APEX CLOUD SYSTEMS INC. - FORMAL OFFER OF EMPLOYMENT
Dear Candidate,
We are pleased to extend this formal offer of employment for the position of Staff Backend Engineer at Apex Cloud Systems Inc.
Reporting to: Director of Engineering
Base Salary: $175,000 USD per annum, paid semi-monthly.
Benefits: Comprehensive medical, dental, and vision insurance, 401(k) retirement matching up to 5%, and 20 days paid vacation.

Equipment & IT Setup:
All necessary enterprise laptops, monitors, and security keys will be provisioned directly by our IT Operations department and delivered to your designated address prior to your start date with zero candidate cost or deposit required.

Acceptance Period:
Please review this contract and sign via our official portal (apexcloud.io/careers/portal) within 10 business days. Should you have questions, contact talent@apexcloud.io.`;

export const PasteTextModal: React.FC<PasteTextModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [text, setText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    setErrorMsg(null);
    const trimmed = text.trim();
    if (!trimmed) {
      setErrorMsg('Please paste the job offer, email text, or recruiter message to analyze.');
      return;
    }
    if (trimmed.length < 20) {
      setErrorMsg('The submitted text is too short to analyze meaningfully. Please provide more context.');
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#090d16] border border-cyan-500/40 p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <AlignLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-mono tracking-wide">
                PASTE OFFER / RECRUITER TEXT
              </h3>
              <p className="text-xs text-slate-400">
                Inspect WhatsApp messages, email appointment letters, or Telegram job contracts
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

        {/* Quick Sample Presets Bar */}
        <div className="mt-3 flex items-center gap-2 flex-wrap text-xs font-mono">
          <span className="text-slate-500 text-[11px]">Quick Samples:</span>
          <button
            type="button"
            onClick={() => { setText(SAMPLE_SCAM_TEXT); setErrorMsg(null); }}
            className="px-2 py-1 rounded bg-red-950/30 hover:bg-red-950/60 border border-red-800/40 text-red-300 transition-colors text-[11px] flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-red-400" />
            <span>Load Scam Sample</span>
          </button>
          <button
            type="button"
            onClick={() => { setText(SAMPLE_LEGIT_TEXT); setErrorMsg(null); }}
            className="px-2 py-1 rounded bg-emerald-950/30 hover:bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 transition-colors text-[11px] flex items-center gap-1"
          >
            <FileCheck2 className="w-3 h-3 text-emerald-400" />
            <span>Load Legit Sample</span>
          </button>
        </div>

        {/* Text Area */}
        <div className="mt-3 flex-1 flex flex-col min-h-0">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="Paste the suspicious job offer letter, recruiter WhatsApp chat, email text, or appointment terms here..."
            className="w-full flex-1 min-h-[220px] bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60 font-mono resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between mt-2 text-xs font-mono text-slate-500">
            <span>Character Count: {text.length.toLocaleString()} / 50,000</span>
            {text.length > 0 && (
              <button
                type="button"
                onClick={() => setText('')}
                className="text-slate-400 hover:text-slate-200 underline"
              >
                Clear text
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="mt-2.5 p-3 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="mt-3 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>Privacy Protocol:</strong> Redact highly sensitive private credentials (e.g., account passwords, bank PINs) before submitting.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || isLoading}
            id="analyze-text-submit-btn"
            className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-md hover:shadow-cyan-500/20 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
          >
            <AlignLeft className="w-4 h-4" />
            <span>{isLoading ? 'Inspecting...' : 'Analyze Text'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
