import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { TextEditor } from './components/TextEditor';
import { SpeechControls } from './components/SpeechControls';
import { AudioPlayer } from './components/AudioPlayer';
import { VoiceLibrary } from './components/VoiceLibrary';
import { HistoryList } from './components/HistoryList';
import { SpellCheckModal } from './components/SpellCheckModal';
import { ShareModal } from './components/ShareModal';
import { AndroidExportModal } from './components/AndroidExportModal';
import { VOICE_PROFILES } from './data/voices';
import { VoiceProfile, SpeechHistoryItem } from './types';
import { generateSpeechAudio } from './utils/audioSynth';
import {
  getStoredHistory,
  saveHistoryItem,
  deleteHistoryItem,
  clearAllHistory,
  getFavoriteVoiceIds,
  toggleFavoriteVoiceId,
} from './utils/storage';
import { Sparkles, Zap, Smartphone, CheckCircle, Volume2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('generate');
  const [darkMode, setDarkMode] = useState(true);

  // Speech Generation Parameters
  const [text, setText] = useState(
    'Welcome to Vocalize AI! Convert text to natural, high-quality speech with 20+ American English regional accent voices, custom speed, pitch controls, and one-tap audio downloads.'
  );
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfile>(VOICE_PROFILES[0]);
  const [favoriteVoiceIds, setFavoriteVoiceIds] = useState<string[]>([]);
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [format, setFormat] = useState<'mp3' | 'wav'>('wav');

  // Generation State & Output
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<{
    audioUrl: string;
    blob: Blob | null;
    durationSeconds: number;
    source: 'ai' | 'fallback';
  } | null>(null);

  // History State
  const [history, setHistory] = useState<SpeechHistoryItem[]>([]);

  // Modals State
  const [isSpellCheckOpen, setIsSpellCheckOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [shareData, setShareData] = useState<{
    audioUrl: string | null;
    blob: Blob | null;
    text: string;
  }>({ audioUrl: null, blob: null, text: '' });

  // Load storage data on mount
  useEffect(() => {
    setHistory(getStoredHistory());
    setFavoriteVoiceIds(getFavoriteVoiceIds());
  }, []);

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleToggleFavorite = (voiceId: string) => {
    const updated = toggleFavoriteVoiceId(voiceId);
    setFavoriteVoiceIds(updated);
  };

  const handleGenerateSpeech = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    try {
      const result = await generateSpeechAudio({
        text: text.trim(),
        voice: selectedVoice,
        speed,
        pitch,
        volume,
        format,
      });

      setCurrentAudio(result);

      // Save to history
      const historyItem: SpeechHistoryItem = {
        id: `speech_${Date.now()}`,
        text: text.trim(),
        voiceId: selectedVoice.id,
        voiceName: selectedVoice.name,
        accent: selectedVoice.accent,
        timestamp: Date.now(),
        audioUrl: result.audioUrl,
        format,
        durationSeconds: result.durationSeconds,
        speed,
        pitch,
        characterCount: text.length,
      };

      const updatedHistory = saveHistoryItem(historyItem);
      setHistory(updatedHistory);
    } catch (err) {
      console.error('Speech generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayHistoryItem = (item: SpeechHistoryItem) => {
    // Find matching voice if available
    const voice = VOICE_PROFILES.find((v) => v.id === item.voiceId) || selectedVoice;
    setSelectedVoice(voice);
    setCurrentAudio({
      audioUrl: item.audioUrl,
      blob: null,
      durationSeconds: item.durationSeconds,
      source: 'ai',
    });
    setActiveTab('generate');
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
  };

  const handleClearHistory = () => {
    const updated = clearAllHistory();
    setHistory(updated);
  };

  const handleOpenShareModal = (
    audioUrl: string,
    blob: Blob | null,
    shareText: string
  ) => {
    setShareData({ audioUrl, blob, text: shareText });
    setIsShareModalOpen(true);
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      } font-sans selection:bg-indigo-500 selection:text-white pb-24 transition-colors duration-200`}
    >
      {/* Top App Bar Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Tab 1: Speech Generation View */}
        {activeTab === 'generate' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Text Editor */}
            <TextEditor
              text={text}
              onChangeText={setText}
              onOpenSpellCheck={() => setIsSpellCheckOpen(true)}
              speed={speed}
            />

            {/* Speech Controls */}
            <SpeechControls
              selectedVoice={selectedVoice}
              speed={speed}
              pitch={pitch}
              volume={volume}
              format={format}
              isGenerating={isGenerating}
              onChangeSpeed={setSpeed}
              onChangePitch={setPitch}
              onChangeVolume={setVolume}
              onChangeFormat={setFormat}
              onOpenVoiceLibrary={() => setActiveTab('voices')}
              onGenerate={handleGenerateSpeech}
              disabled={!text.trim()}
            />

            {/* Generated Audio Player Output */}
            {currentAudio && (
              <AudioPlayer
                audioUrl={currentAudio.audioUrl}
                blob={currentAudio.blob}
                voice={selectedVoice}
                format={format}
                durationSeconds={currentAudio.durationSeconds}
                source={currentAudio.source}
                text={text}
                onOpenShareModal={handleOpenShareModal}
              />
            )}
          </div>
        )}

        {/* Tab 2: 20+ American Voices Library */}
        {activeTab === 'voices' && (
          <div className="animate-in fade-in duration-200">
            <VoiceLibrary
              selectedVoice={selectedVoice}
              favoriteVoiceIds={favoriteVoiceIds}
              onSelectVoice={(voice) => {
                setSelectedVoice(voice);
                setActiveTab('generate');
              }}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        )}

        {/* Tab 3: History List */}
        {activeTab === 'history' && (
          <div className="animate-in fade-in duration-200">
            <HistoryList
              history={history}
              onPlayItem={handlePlayHistoryItem}
              onDeleteItem={handleDeleteHistoryItem}
              onClearHistory={handleClearHistory}
              onOpenShareModal={handleOpenShareModal}
            />
          </div>
        )}

        {/* Tab 4: Android APK Setup Guide */}
        {activeTab === 'android' && (
          <div className="bg-slate-900/80 rounded-3xl p-6 border border-slate-800 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Vocalize AI Android Setup</h2>
                <p className="text-xs text-slate-400">
                  Ready for Android 10 to 16, GitHub, and Android Studio
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> 1-Tap PWA Install
                </div>
                <p className="text-xs text-slate-300">
                  Tap Chrome menu (⋮) and select "Install app" or "Add to Home Screen" to run as an APK app.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-indigo-400 font-bold text-sm flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Capacitor Android
                </div>
                <p className="text-xs text-slate-300">
                  Includes <code className="text-indigo-300">capacitor.config.json</code> &amp; <code className="text-indigo-300">AndroidManifest.xml</code>.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-purple-400 font-bold text-sm flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Flutter Source
                </div>
                <p className="text-xs text-slate-300">
                  Includes <code className="text-purple-300">pubspec.yaml</code> and <code className="text-purple-300">lib/main.dart</code> for Flutter builds.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsAndroidModalOpen(true)}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                Open Complete Android Installation &amp; Build Guide
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        historyCount={history.length}
      />

      {/* Modals */}
      <SpellCheckModal
        isOpen={isSpellCheckOpen}
        text={text}
        onClose={() => setIsSpellCheckOpen(false)}
        onApplyCorrection={(corrected) => setText(corrected)}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        audioUrl={shareData.audioUrl}
        blob={shareData.blob}
        text={shareData.text}
        onClose={() => setIsShareModalOpen(false)}
      />

      <AndroidExportModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />
    </div>
  );
}
