import React, { useState } from 'react';
import { VOICE_PROFILES, REGIONAL_ACCENTS_LIST } from '../data/voices';
import { VoiceProfile, RegionalAccent, Gender } from '../types';
import { VoiceCard } from './VoiceCard';
import { Search, Star, Filter, Users, Sparkles } from 'lucide-react';

interface VoiceLibraryProps {
  selectedVoice: VoiceProfile;
  favoriteVoiceIds: string[];
  onSelectVoice: (voice: VoiceProfile) => void;
  onToggleFavorite: (voiceId: string) => void;
}

export const VoiceLibrary: React.FC<VoiceLibraryProps> = ({
  selectedVoice,
  favoriteVoiceIds,
  onSelectVoice,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccent, setSelectedAccent] = useState<string>('All Accents');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const filteredVoices = VOICE_PROFILES.filter((voice) => {
    // Search query filter
    const matchesSearch =
      voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.accent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Accent filter
    const matchesAccent =
      selectedAccent === 'All Accents' || voice.accent === selectedAccent;

    // Gender filter
    const matchesGender =
      selectedGender === 'All' || voice.gender === selectedGender;

    // Favorite filter
    const matchesFavorite = !onlyFavorites || favoriteVoiceIds.includes(voice.id);

    return matchesSearch && matchesAccent && matchesGender && matchesFavorite;
  });

  return (
    <div className="space-y-5">
      {/* Search & Top Filters Header */}
      <div className="bg-slate-900/80 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              American Accent Voice Library
            </h2>
            <p className="text-xs text-slate-400">
              20+ realistic male and female voices across 7 regional US accents.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search voice or accent..."
              className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl pl-9 pr-3 py-2.5 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Accent Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {REGIONAL_ACCENTS_LIST.map((accent) => (
            <button
              key={accent}
              type="button"
              onClick={() => setSelectedAccent(accent)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedAccent === accent
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              {accent}
            </button>
          ))}
        </div>

        {/* Secondary Filters: Gender & Favorites */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/60 text-xs">
          {/* Gender Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {['All', 'Female', 'Male'].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGender(g)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  selectedGender === g
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Favorite Voices Toggle */}
          <button
            type="button"
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-semibold transition-all cursor-pointer ${
              onlyFavorites
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
            }`}
          >
            <Star
              className={`w-3.5 h-3.5 ${
                onlyFavorites ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
              }`}
            />
            <span>Favorites Only ({favoriteVoiceIds.length})</span>
          </button>
        </div>
      </div>

      {/* Voice Grid List */}
      {filteredVoices.length === 0 ? (
        <div className="bg-slate-900/60 rounded-3xl p-8 border border-slate-800 text-center space-y-3">
          <Filter className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No matching voices found</h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search query, accent filter, or favorites toggle.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedAccent('All Accents');
              setSelectedGender('All');
              setOnlyFavorites(false);
            }}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-500 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVoices.map((voice) => (
            <VoiceCard
              key={voice.id}
              voice={voice}
              isSelected={selectedVoice.id === voice.id}
              isFavorite={favoriteVoiceIds.includes(voice.id)}
              onSelect={onSelectVoice}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};
