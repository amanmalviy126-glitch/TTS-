import React, { useState } from 'react';
import {
  Copy,
  Trash2,
  Clipboard,
  SpellCheck,
  BookOpen,
  Sparkles,
  Check,
  RotateCcw,
} from 'lucide-react';
import { SAMPLE_TEXT_TEMPLATES } from '../data/voices';

interface TextEditorProps {
  text: string;
  onChangeText: (newText: string) => void;
  onOpenSpellCheck: () => void;
  speed: number;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  text,
  onChangeText,
  onOpenSpellCheck,
  speed,
}) => {
  const [copied, setCopied] = useState(false);

  const characterCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  // Estimated audio duration in seconds
  const estimatedSeconds = Math.round((wordCount * 0.42) / speed);
  const minutes = Math.floor(estimatedSeconds / 60);
  const seconds = estimatedSeconds % 60;
  const formattedDuration =
    minutes > 0
      ? `${minutes}m ${seconds}s est.`
      : `${seconds}s est. duration`;

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        onChangeText(text ? `${text} ${clipboardText}` : clipboardText);
      }
    } catch {
      // fallback
    }
  };

  const handleClear = () => {
    onChangeText('');
  };

  return (
    <div className="bg-slate-900/80 dark:bg-slate-900/90 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl transition-all">
      {/* Top Header Controls & Sample Templates */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Enter Text to Vocalize
        </label>

        {/* Quick Sample Selector */}
        <div className="flex items-center gap-2">
          <select
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                const found = SAMPLE_TEXT_TEMPLATES.find((t) => t.label === val);
                if (found) onChangeText(found.text);
              }
              e.target.value = '';
            }}
            defaultValue=""
            className="bg-slate-800 hover:bg-slate-700/80 text-xs font-medium text-slate-200 border border-slate-700/80 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="" disabled>
              ⚡ Load Sample Script...
            </option>
            {SAMPLE_TEXT_TEMPLATES.map((tpl) => (
              <option key={tpl.label} value={tpl.label}>
                {tpl.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative mb-3">
        <textarea
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder="Type or paste your text here (e.g. 'Welcome to Vocalize AI! Convert text to 20+ realistic American accent voices...')."
          rows={5}
          maxLength={3000}
          className="w-full bg-slate-950/70 text-slate-100 placeholder-slate-500 text-sm sm:text-base rounded-2xl p-4 border border-slate-800 focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none resize-y transition-all leading-relaxed"
        ></textarea>
      </div>

      {/* Bottom Bar: Stats & Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        {/* Character & Word Counters */}
        <div className="flex items-center gap-3 font-medium">
          <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/50">
            <strong className="text-slate-200">{characterCount}</strong> / 3,000 chars
          </span>
          <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/50">
            <strong className="text-slate-200">{wordCount}</strong> words
          </span>
          <span className="text-indigo-400 font-semibold bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 hidden sm:inline-block">
            ⏱️ {formattedDuration}
          </span>
        </div>

        {/* Action Buttons: Spell-check, Copy, Paste, Clear */}
        <div className="flex items-center gap-1.5">
          {/* English Spell-check */}
          <button
            type="button"
            onClick={onOpenSpellCheck}
            disabled={!text.trim()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold disabled:opacity-40 transition-all cursor-pointer"
            title="Check English spelling & grammar"
          >
            <SpellCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Spell Check</span>
          </button>

          {/* Paste */}
          <button
            type="button"
            onClick={handlePaste}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-all active:scale-95 cursor-pointer"
            title="Paste text from clipboard"
          >
            <Clipboard className="w-3.5 h-3.5" />
          </button>

          {/* Copy */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={!text.trim()}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 disabled:opacity-40 transition-all active:scale-95 cursor-pointer"
            title="Copy text to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Clear */}
          <button
            type="button"
            onClick={handleClear}
            disabled={!text.trim()}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700/60 disabled:opacity-40 transition-all active:scale-95 cursor-pointer"
            title="Clear text"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
