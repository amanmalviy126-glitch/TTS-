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
    style={{
      color: "white",
      background: "#111",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: 30,
    }}
>
  Vocalize AI Working
</div>
);
}