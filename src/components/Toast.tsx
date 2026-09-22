/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'error' | 'success' | 'info';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const getStyle = () => {
    switch (toast.type) {
      case 'error':
        return 'bg-red-950/90 border-red-500/50 text-red-200';
      case 'success':
        return 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200';
      case 'info':
      default:
        return 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full px-4 animate-slideUp">
      <div className={`p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-start gap-3 ${getStyle()}`}>
        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
        {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
        {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />}

        <div className="flex-1 text-xs font-mono leading-relaxed">
          {toast.message}
        </div>

        <button 
          onClick={onDismiss} 
          className="text-slate-400 hover:text-slate-200 p-1 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
