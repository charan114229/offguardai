/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, X, AlertCircle, ShieldAlert } from 'lucide-react';

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: { name: string; type: string; base64: string; size: number }) => void;
  isLoading: boolean;
}

export const UploadFileModal: React.FC<UploadFileModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [selectedFile, setSelectedFile] = useState<{
    file: File;
    name: string;
    type: string;
    size: number;
    previewUrl?: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validateAndProcessFile = (file: File) => {
    setErrorMsg(null);
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Unsupported format. Please upload a PDF, PNG, JPG, or WEBP document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 10MB safety threshold.');
      return;
    }

    let previewUrl: string | undefined;
    if (file.type.startsWith('image/')) {
      previewUrl = URL.createObjectURL(file);
    }

    setSelectedFile({
      file,
      name: file.name,
      type: file.type,
      size: file.size,
      previewUrl,
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleAnalyze = () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onSubmit({
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        base64,
      });
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read the file safely. Please retry.');
    };
    reader.readAsDataURL(selectedFile.file);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#090d16] border border-cyan-500/40 p-6 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-mono tracking-wide">
                DOCUMENT / IMAGE INSPECTION
              </h3>
              <p className="text-xs text-slate-400">
                Inspect offer letter PDFs, contract screenshots, or appointment scans
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

        {/* Drag & Drop Area */}
        <div className="mt-5">
          {!selectedFile ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]' 
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-900/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-cyan-400 mb-3 border border-slate-800">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-200">
                Drag and drop your offer letter file here, or <span className="text-cyan-400 underline underline-offset-2">browse files</span>
              </p>
              <p className="text-xs text-slate-400 mt-1.5 font-mono">
                Supported formats: PDF, PNG, JPG, JPEG, WEBP (Max 10MB)
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 shrink-0">
                    {selectedFile.type === 'application/pdf' ? (
                      <FileText className="w-6 h-6" />
                    ) : (
                      <ImageIcon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs font-mono text-slate-400">
                      {formatSize(selectedFile.size)} • {selectedFile.type.split('/')[1]?.toUpperCase()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedFile(null)}
                  disabled={isLoading}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Image Preview if available */}
              {selectedFile.previewUrl && (
                <div className="mt-3 max-h-40 overflow-hidden rounded-lg border border-slate-800 bg-slate-900/50 flex items-center justify-center p-2">
                  <img
                    src={selectedFile.previewUrl}
                    alt="File preview"
                    className="max-h-36 object-contain rounded"
                  />
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="mt-3 p-3 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Security & Privacy Notice */}
        <div className="mt-4 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong>Privacy Safeguard:</strong> Uploaded files are evaluated in memory without permanent document retention. Do not upload passwords, OTPs, or financial payment cards.
          </span>
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
            onClick={handleAnalyze}
            disabled={!selectedFile || isLoading}
            id="analyze-file-submit-btn"
            className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-md hover:shadow-cyan-500/20 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{isLoading ? 'Scanning...' : 'Analyze Document'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
