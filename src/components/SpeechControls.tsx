import React from 'react';
import { VoiceProfile } from '../types';
import {
  Gauge,
  Sliders,
  Volume2,
  Sparkles,
  Users,
  Music,
  RotateCcw,
  Zap,
} from 'lucide-react';

interface SpeechControlsProps {
  selectedVoice: VoiceProfile;
  speed: number;
  pitch: number;
  volume: number;
  format: 'mp3' | 'wav';
  isGenerating: boolean;
  onChangeSpeed: (val: number) => void;
  onChangePitch: (val: number) => void;
  onChangeVolume: (val: number) => void;
  onChangeFormat: (fmt: 'mp3' | 'wav') => void;
  onOpenVoiceLibrary: () => void;
  onGenerate: () => void;
  disabled: boolean;
}

export const SpeechControls: React.FC<SpeechControlsProps> = ({
  selectedVoice,
  speed,
  pitch,
  volume,
  format,
  isGenerating,
  onChangeSpeed,
  onChangePitch,
  onChangeVolume,
  onChangeFormat,
  onOpenVoiceLibrary,
  onGenerate,
  disabled,
}) => {
  const speedPresets = [0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="bg-slate-900/80 dark:bg-slate-900/90 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-5">
      {/* Active Voice Summary & Quick Changer */}
      <div className="flex items-center justify-between gap-3 p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${selectedVoice.avatarBg} p-0.5 shadow-md flex items-center justify-center shrink-0`}
          >
            <div className="w-full h-full bg-slate-950/80 rounded-[14px] flex items-center justify-center font-bold text-white text-sm">
              {selectedVoice.name.charAt(0)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-100 text-sm">{selectedVoice.name}</h4>
              <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.2 rounded-full">
                {selectedVoice.accent}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {selectedVoice.gender} • {selectedVoice.location}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenVoiceLibrary}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span>Change Voice</span>
        </button>
      </div>

      {/* Sliders Grid: Speed, Pitch, Volume */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Speed Slider */}
        <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-indigo-400" /> Speech Speed
            </span>
            <span className="font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
              {speed.toFixed(2)}x
            </span>
          </div>

          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={speed}
            onChange={(e) => onChangeSpeed(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />

          {/* Quick Speed Preset Chips */}
          <div className="flex items-center justify-between gap-1 pt-1">
            {speedPresets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onChangeSpeed(p)}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                  speed === p
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                }`}
              >
                {p}x
              </button>
            ))}
          </div>
        </div>

        {/* Pitch Slider */}
        <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-400" /> Pitch Tone
            </span>
            <span className="font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
              {pitch.toFixed(2)}x
            </span>
          </div>

          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={pitch}
            onChange={(e) => onChangePitch(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
            <span>Low Pitch</span>
            <button
              type="button"
              onClick={() => onChangePitch(1.0)}
              className="text-slate-400 hover:text-purple-300 flex items-center gap-0.5 cursor-pointer"
            >
              <RotateCcw className="w-2.5 h-2.5" /> Reset (1.0x)
            </button>
            <span>High Pitch</span>
          </div>
        </div>

        {/* Volume & Format */}
        <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> Volume & Export
            </span>
            <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              {Math.round(volume * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={volume}
            onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          {/* Audio Format Selector */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400 font-medium">Export Format:</span>
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => onChangeFormat('mp3')}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  format === 'mp3'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                MP3
              </button>
              <button
                type="button"
                onClick={() => onChangeFormat('wav')}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  format === 'wav'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                WAV
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Button: Generate Speech */}
      <div>
        <button
          type="button"
          onClick={onGenerate}
          disabled={disabled || isGenerating}
          className={`w-full py-4 rounded-2xl font-bold text-base shadow-xl flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] cursor-pointer ${
            disabled
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white shadow-indigo-600/30'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Vocalizing Text with AI...</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
              <span>Generate Natural Speech ({format.toUpperCase()})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
