import React, { useState } from 'react';
import { VoiceProfile } from '../types';
import { Play, Pause, Star, MapPin, Sparkles, Volume2 } from 'lucide-react';
import { speakPreviewLocal } from '../utils/audioSynth';

interface VoiceCardProps {
  voice: VoiceProfile;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: (voice: VoiceProfile) => void;
  onToggleFavorite: (voiceId: string) => void;
}

export const VoiceCard: React.FC<VoiceCardProps> = ({
  voice,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
}) => {
  const [isPreviewing, setIsPreviewing] = useState(false);

  const handlePreview = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPreviewing) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsPreviewing(false);
      return;
    }

    setIsPreviewing(true);
    await speakPreviewLocal(voice.previewText, voice);
    setIsPreviewing(false);
  };

  return (
    <div
      onClick={() => onSelect(voice)}
      className={`relative group rounded-2xl p-4 border transition-all cursor-pointer ${
        isSelected
          ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/30'
          : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Header: Avatar, Name, Favorite Star */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          {/* Avatar Icon */}
          <div
            className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${voice.avatarBg} p-0.5 shadow-md flex items-center justify-center shrink-0`}
          >
            <div className="w-full h-full bg-slate-950/80 rounded-[14px] flex items-center justify-center font-bold text-white text-base">
              {voice.name.charAt(0)}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-slate-100 text-sm group-hover:text-indigo-300 transition-colors">
                {voice.name}
              </h3>
              <span
                className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                  voice.gender === 'Female'
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}
              >
                {voice.gender}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-500" />
              <span>{voice.location}</span>
            </p>
          </div>
        </div>

        {/* Favorite Star Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(voice.id);
          }}
          className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star
            className={`w-4 h-4 ${
              isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-500'
            }`}
          />
        </button>
      </div>

      {/* Accent Badge & Description */}
      <div className="mb-3">
        <span className="inline-block px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 rounded-lg mb-1.5">
          {voice.accent}
        </span>
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {voice.description}
        </p>
      </div>

      {/* Footer: Preview Button & Select Pill */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
        {/* Preview Voice Button */}
        <button
          type="button"
          onClick={handlePreview}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer ${
            isPreviewing
              ? 'bg-indigo-600 text-white border-indigo-500 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-slate-700'
          }`}
        >
          {isPreviewing ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Playing Sample...</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Preview Voice</span>
            </>
          )}
        </button>

        {/* Selected Indicator */}
        {isSelected && (
          <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Selected
          </span>
        )}
      </div>
    </div>
  );
};
