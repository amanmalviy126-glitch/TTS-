import React, { useState } from 'react';
import {
  Share2,
  X,
  MessageCircle,
  Instagram,
  Send,
  Mail,
  Copy,
  Check,
  Download,
  Smartphone,
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  audioUrl: string | null;
  blob: Blob | null;
  text: string;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  audioUrl,
  blob,
  text,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !audioUrl) return null;

  const encodedText = encodeURIComponent(`Listen to this natural speech generated with Vocalize AI:\n"${text.substring(0, 100)}..."`);
  const currentAppUrl = window.location.href;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'vocalize.wav', { type: blob.type })] })) {
          const file = new File([blob], 'VocalizeAI_Speech.wav', { type: blob.type });
          await navigator.share({
            title: 'Vocalize AI Speech Audio',
            text: text.substring(0, 100),
            files: [file],
          });
          return;
        }

        await navigator.share({
          title: 'Vocalize AI Text-to-Speech',
          text: `Listen to this speech generated with Vocalize AI:\n"${text}"`,
          url: currentAppUrl,
        });
      } catch (err) {
        console.log('Share canceled or error:', err);
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentAppUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const shareTargets = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      bgColor: 'bg-emerald-600 hover:bg-emerald-500',
      action: () => {
        window.open(`https://api.whatsapp.com/send?text=${encodedText}%20${encodeURIComponent(currentAppUrl)}`, '_blank');
      },
    },
    {
      name: 'Telegram',
      icon: Send,
      bgColor: 'bg-sky-600 hover:bg-sky-500',
      action: () => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(currentAppUrl)}&text=${encodedText}`, '_blank');
      },
    },
    {
      name: 'Instagram / Stories',
      icon: Instagram,
      bgColor: 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-90',
      action: () => {
        handleNativeShare();
      },
    },
    {
      name: 'Email',
      icon: Mail,
      bgColor: 'bg-indigo-600 hover:bg-indigo-500',
      action: () => {
        window.open(`mailto:?subject=Vocalize%20AI%20Audio%20Speech&body=${encodedText}%20${encodeURIComponent(currentAppUrl)}`);
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl space-y-5 p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Share Audio Output</h3>
              <p className="text-xs text-slate-400">Export or send generated speech file</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Buttons Grid */}
        <div className="grid grid-cols-2 gap-3">
          {shareTargets.map((target) => {
            const Icon = target.icon;
            return (
              <button
                key={target.name}
                onClick={target.action}
                className={`py-3 px-3 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer ${target.bgColor}`}
              >
                <Icon className="w-4 h-4" />
                <span>{target.name}</span>
              </button>
            );
          })}
        </div>

        {/* System Native Share */}
        {navigator.share && (
          <button
            onClick={handleNativeShare}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-indigo-400" />
            <span>Open Android Native Share Menu</span>
          </button>
        )}

        {/* Copy App Link */}
        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between gap-2">
          <span className="text-xs text-slate-400 truncate flex-1">{currentAppUrl}</span>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
