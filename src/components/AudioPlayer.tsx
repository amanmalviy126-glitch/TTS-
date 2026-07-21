import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  Sparkles,
  Check,
  Volume2,
  Share,
} from 'lucide-react';
import { VoiceProfile } from '../types';

interface AudioPlayerProps {
  audioUrl: string | null;
  blob: Blob | null;
  voice: VoiceProfile;
  format: 'mp3' | 'wav';
  durationSeconds: number;
  source: 'ai' | 'fallback';
  text: string;
  onOpenShareModal: (audioUrl: string, blob: Blob | null, text: string) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  blob,
  voice,
  format,
  durationSeconds,
  source,
  text,
  onOpenShareModal,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [audioUrl]);

  if (!audioUrl) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    const filename = `VocalizeAI_${voice.name.replace(/\s+/g, '')}_${Date.now()}.${format}`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const totalDuration = audioRef.current?.duration || durationSeconds || 1;

  return (
    <div className="bg-gradient-to-br from-indigo-950/90 via-slate-900 to-slate-950 rounded-3xl p-5 border border-indigo-500/40 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Hidden Native Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Header Info Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-indigo-500/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-white text-sm">Generated Speech Output</h4>
              <span className="px-2 py-0.2 text-[10px] font-bold bg-indigo-500/30 text-indigo-200 rounded-full uppercase tracking-wider">
                {format}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Voice: <strong className="text-indigo-300">{voice.name}</strong> ({voice.accent})
            </p>
          </div>
        </div>

        {/* Source Badge */}
        <span
          className={`px-2.5 py-1 text-[11px] font-semibold rounded-xl border flex items-center gap-1 ${
            source === 'ai'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          {source === 'ai' ? 'Gemini AI Voice' : 'Offline Synth'}
        </span>
      </div>

      {/* Animated Sound Waveform Bars */}
      <div className="flex items-center justify-center gap-1 h-10 py-1 px-4 bg-slate-950/60 rounded-2xl border border-slate-800">
        {[40, 75, 30, 90, 60, 100, 45, 80, 55, 95, 35, 70, 85, 50, 90, 40, 65, 80, 45, 95].map(
          (height, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                isPlaying ? 'bg-indigo-400 animate-pulse' : 'bg-slate-700'
              }`}
              style={{
                height: isPlaying ? `${Math.max(15, (height * (i % 3 + 1)) % 100)}%` : `${height}%`,
              }}
            />
          )
        )}
      </div>

      {/* Play / Pause & Seek Bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="w-12 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>

          <div className="flex-1 space-y-1">
            <input
              type="range"
              min="0"
              max={totalDuration || 1}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export & Download Buttons Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {/* Large One-Tap Download Button */}
        <button
          type="button"
          onClick={handleDownload}
          className={`py-3.5 px-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 border transition-all active:scale-[0.98] cursor-pointer ${
            downloaded
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-400 font-extrabold shadow-emerald-500/20'
          }`}
        >
          {downloaded ? (
            <>
              <Check className="w-5 h-5" />
              <span>Saved to Downloads Folder!</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Download Audio ({format.toUpperCase()})</span>
            </>
          )}
        </button>

        {/* Share Button (WhatsApp, Instagram, Telegram, Email) */}
        <button
          type="button"
          onClick={() => onOpenShareModal(audioUrl, blob, text)}
          className="py-3.5 px-4 rounded-2xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
        >
          <Share2 className="w-5 h-5 text-indigo-400" />
          <span>Share Audio File</span>
        </button>
      </div>
    </div>
  );
};
