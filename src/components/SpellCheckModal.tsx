import React, { useState, useEffect } from 'react';
import { SpellCheckResult } from '../types';
import { SpellCheck, Check, X, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';

interface SpellCheckModalProps {
  isOpen: boolean;
  text: string;
  onClose: () => void;
  onApplyCorrection: (correctedText: string) => void;
}

export const SpellCheckModal: React.FC<SpellCheckModalProps> = ({
  isOpen,
  text,
  onClose,
  onApplyCorrection,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SpellCheckResult | null>(null);

  useEffect(() => {
    if (isOpen && text.trim()) {
      runSpellCheck();
    }
  }, [isOpen]);

  const runSpellCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/spellcheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        setResult({
          hasErrors: false,
          correctedText: text,
          suggestions: [],
        });
      }
    } catch {
      setResult({
        hasErrors: false,
        correctedText: text,
        suggestions: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4 p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
              <SpellCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">English Spell & Grammar Check</h3>
              <p className="text-xs text-slate-400">Powered by Gemini AI American English Editor</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="py-10 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-300 font-medium">
              Analyzing text for spelling, punctuation, and grammar...
            </p>
          </div>
        ) : result ? (
          <div className="space-y-4">
            {result.suggestions.length === 0 ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2">
                <Check className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-emerald-300 text-sm">Perfect English! No errors found.</h4>
                <p className="text-xs text-slate-300">
                  Your text is well-formatted and ready for high-quality speech generation.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {result.suggestions.length} Suggested Corrections Found:
                  </span>
                </div>

                <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                  {result.suggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-red-400 font-semibold line-through">{sug.original}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-emerald-400 font-bold">{sug.suggestion}</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{sug.reason}</p>
                    </div>
                  ))}
                </div>

                {/* Corrected Text Preview */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Polished Output:</label>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed">
                    {result.correctedText}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
          >
            Cancel
          </button>

          {result && result.suggestions.length > 0 && (
            <button
              onClick={() => {
                onApplyCorrection(result.correctedText);
                onClose();
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply Corrections</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
