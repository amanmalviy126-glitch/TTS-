import React, { useState } from 'react';
import { SpeechHistoryItem } from '../types';
import {
  History,
  Play,
  Pause,
  Download,
  Share2,
  Trash2,
  Volume2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface HistoryListProps {
  history: SpeechHistoryItem[];
  onPlayItem: (item: SpeechHistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
  onOpenShareModal: (audioUrl: string, blob: Blob | null, text: string) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onPlayItem,
  onDeleteItem,
  onClearHistory,
  onOpenShareModal,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);

  if (history.length === 0) {
    return (
      <div className="bg-slate-900/80 rounded-3xl p-10 border border-slate-800 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto">
          <History className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">No Speech History Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Generated text-to-speech audio files will automatically appear here for easy playback, export, and sharing.
          </p>
        </div>
      </div>
    );
  }

  const handleDownload = (item: SpeechHistoryItem) => {
    const a = document.createElement('a');
    a.href = item.audioUrl;
    a.download = `VocalizeAI_${item.voiceName.replace(/\s+/g, '')}_${item.timestamp}.${item.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatDate = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-slate-900/80 rounded-2xl p-4 border border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-base">Generated Audio History ({history.length})</h3>
        </div>

        <button
          type="button"
          onClick={onClearHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold transition-all cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      {/* History Items List */}
      <div className="space-y-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/70 hover:bg-slate-900/90 rounded-2xl p-4 border border-slate-800 transition-all space-y-3"
          >
            {/* Top Info */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white text-sm">{item.voiceName}</span>
                  <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.2 rounded-full">
                    {item.accent}
                  </span>
                  <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.2 rounded-md uppercase">
                    {item.format}
                  </span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  "{item.text}"
                </p>
              </div>

              <button
                type="button"
                onClick={() => onDeleteItem(item.id)}
                className="p-1.5 rounded-xl hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                title="Delete history item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Controls Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                {/* Play Button */}
                <button
                  type="button"
                  onClick={() => onPlayItem(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md cursor-pointer transition-all active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Play Speech</span>
                </button>

                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3" /> {formatDate(item.timestamp)}
                </span>
              </div>

              {/* Download & Share Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleDownload(item)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
                  title="Download audio file"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenShareModal(item.audioUrl, null, item.text)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition-all cursor-pointer"
                  title="Share audio"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
