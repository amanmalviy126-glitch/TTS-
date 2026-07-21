import { SpeechHistoryItem } from '../types';

const HISTORY_KEY = 'vocalize_speech_history_v1';
const FAVORITES_KEY = 'vocalize_favorite_voices_v1';

export function getStoredHistory(): SpeechHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistoryItem(item: SpeechHistoryItem): SpeechHistoryItem[] {
  try {
    const history = getStoredHistory();
    // Add to top of array
    const updated = [item, ...history].slice(0, 50); // Keep max 50 items
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save history item', err);
    return getStoredHistory();
  }
}

export function deleteHistoryItem(id: string): SpeechHistoryItem[] {
  try {
    const history = getStoredHistory();
    const updated = history.filter((i) => i.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return getStoredHistory();
  }
}

export function clearAllHistory(): SpeechHistoryItem[] {
  try {
    localStorage.removeItem(HISTORY_KEY);
    return [];
  } catch {
    return [];
  }
}

export function getFavoriteVoiceIds(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : ['gen-amer-1', 'south-1', 'ny-1'];
  } catch {
    return ['gen-amer-1', 'south-1', 'ny-1'];
  }
}

export function toggleFavoriteVoiceId(voiceId: string): string[] {
  try {
    const favs = getFavoriteVoiceIds();
    const exists = favs.includes(voiceId);
    const updated = exists ? favs.filter((id) => id !== voiceId) : [...favs, voiceId];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return getFavoriteVoiceIds();
  }
}
