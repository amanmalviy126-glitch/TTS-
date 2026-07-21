import React from 'react';
import { Mic, Users, History, Smartphone } from 'lucide-react';

export type NavTab = 'generate' | 'voices' | 'history' | 'android';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  historyCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  historyCount,
}) => {
  const tabs = [
    { id: 'generate' as NavTab, label: 'Generate', icon: Mic },
    { id: 'voices' as NavTab, label: 'Voices (24)', icon: Users },
    { id: 'history' as NavTab, label: 'History', icon: History, badge: historyCount > 0 ? historyCount : undefined },
    { id: 'android' as NavTab, label: 'APK Setup', icon: Smartphone },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-2">
      <div className="max-w-lg mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center gap-1 py-1 px-4 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'text-indigo-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              {/* Material 3 Active Indicator pill */}
              <div
                className={`flex items-center justify-center px-4 py-1 rounded-full transition-all ${
                  isActive ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 scale-105' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              </div>
              <span className="text-[11px] tracking-tight">{tab.label}</span>

              {tab.badge !== undefined && (
                <span className="absolute top-1 right-3 px-1.5 py-0.2 text-[9px] font-bold bg-indigo-500 text-white rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
