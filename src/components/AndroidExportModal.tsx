import React, { useState } from 'react';
import {
  Smartphone,
  X,
  Download,
  CheckCircle2,
  Terminal,
  Layers,
  Sparkles,
  ExternalLink,
  Code,
} from 'lucide-react';

interface AndroidExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidExportModal: React.FC<AndroidExportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'pwa' | 'capacitor' | 'flutter'>('pwa');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Android APK & Installation Guide</h3>
              <p className="text-xs text-slate-400">
                Install on Android 10–16 or export for Android Studio / GitHub
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'pwa'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            📱 1-Tap PWA Install
          </button>
          <button
            onClick={() => setActiveTab('capacitor')}
            className={`flex-1 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'capacitor'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ Android Studio / APK
          </button>
          <button
            onClick={() => setActiveTab('flutter')}
            className={`flex-1 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'flutter'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🎯 Flutter Native Code
          </button>
        </div>

        {/* Tab 1: PWA Web APK */}
        {activeTab === 'pwa' && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-2">
              <h4 className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant Installation on Android Devices
              </h4>
              <p>
                Vocalize AI is optimized as a Progressive Web App (PWA) with full Android 10, 11, 12, 13, 14, 15, and 16 hardware acceleration, audio output, and offline speech synthesis support.
              </p>
            </div>

            <div className="space-y-2 font-medium">
              <p className="font-bold text-white text-sm">How to install on your Android Phone or Tablet:</p>
              <ol className="list-decimal list-inside space-y-2 pl-1 text-slate-300">
                <li>Open this app URL in <strong>Google Chrome for Android</strong> or <strong>Samsung Internet</strong>.</li>
                <li>Tap the <strong>Three Dots Menu (⋮)</strong> at the top right of your browser.</li>
                <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                <li>Tap <strong>Install</strong>. Vocalize AI will now launch as a full standalone Android app with an icon in your app drawer!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 2: Capacitor APK / Android Studio */}
        {activeTab === 'capacitor' && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <p>
              This repository includes a pre-configured <code className="text-indigo-300 bg-slate-950 px-1.5 py-0.5 rounded">capacitor.config.json</code> and <code className="text-indigo-300 bg-slate-950 px-1.5 py-0.5 rounded">AndroidManifest.xml</code> for Android Studio.
            </p>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 font-mono text-[11px] text-indigo-300">
              <div className="text-slate-400">// Step 1: Install Capacitor CLI & build web bundle</div>
              <div>npm run build</div>
              <div>npm install @capacitor/core @capacitor/cli @capacitor/android</div>
              <div className="text-slate-400">// Step 2: Initialize & sync Android project</div>
              <div>npx cap add android</div>
              <div>npx cap sync android</div>
              <div className="text-slate-400">// Step 3: Open in Android Studio & Generate APK</div>
              <div>npx cap open android</div>
            </div>

            <p className="text-slate-400">
              In Android Studio, click <strong>Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong> to generate your signed installable <code className="text-slate-200">.apk</code> file!
            </p>
          </div>
        )}

        {/* Tab 3: Flutter Code */}
        {activeTab === 'flutter' && (
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <p>
              Full Flutter source files have been generated in <code className="text-purple-300 bg-slate-950 px-1.5 py-0.5 rounded">pubspec.yaml</code> and <code className="text-purple-300 bg-slate-950 px-1.5 py-0.5 rounded">lib/main.dart</code>.
            </p>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 font-mono text-[11px] text-purple-300">
              <div className="text-slate-400">// Build standalone Flutter APK</div>
              <div>flutter pub get</div>
              <div>flutter build apk --release</div>
            </div>

            <p className="text-slate-400">
              The compiled APK file will be located at <code className="text-slate-200">build/app/outputs/flutter-apk/app-release.apk</code>.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
