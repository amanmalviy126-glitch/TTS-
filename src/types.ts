export type Gender = 'Male' | 'Female';

export type RegionalAccent = 
  | 'General American'
  | 'Southern US'
  | 'New York'
  | 'Boston'
  | 'Midwestern'
  | 'California / West Coast'
  | 'Texas';

export interface VoiceProfile {
  id: string;
  name: string;
  gender: Gender;
  accent: RegionalAccent;
  location: string;
  description: string;
  previewText: string;
  geminiVoice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  defaultSpeed: number;
  defaultPitch: number;
  tags: string[];
  avatarBg: string;
  sampleAudioPrompt?: string;
}

export interface SpeechHistoryItem {
  id: string;
  text: string;
  voiceId: string;
  voiceName: string;
  accent: RegionalAccent;
  timestamp: number;
  audioUrl: string;
  format: 'mp3' | 'wav';
  durationSeconds: number;
  speed: number;
  pitch: number;
  characterCount: number;
}

export interface SpellCheckResult {
  hasErrors: boolean;
  correctedText: string;
  suggestions: {
    original: string;
    suggestion: string;
    reason: string;
  }[];
}

export interface SpeechGenerateOptions {
  text: string;
  voice: VoiceProfile;
  speed: number;
  pitch: number;
  volume: number;
  format: 'mp3' | 'wav';
}
