import { SpeechGenerateOptions, VoiceProfile } from '../types';

/**
 * Creates a valid WAV Blob from 1-channel Float32 audio samples
 */
export function createWavBlob(samples: Float32Array, sampleRate = 24000): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Converts Base64 PCM data (from Gemini TTS) into a WAV Blob
 */
export function pcmBase64ToWavBlob(base64Pcm: string, sampleRate = 24000): Blob {
  const binaryString = window.atob(base64Pcm);
  const len = binaryString.length;
  const dataView = new DataView(new ArrayBuffer(len));
  for (let i = 0; i < len; i++) {
    dataView.setUint8(i, binaryString.charCodeAt(i));
  }
  const int16Samples = new Int16Array(len / 2);
  for (let i = 0; i < int16Samples.length; i++) {
    int16Samples[i] = dataView.getInt16(i * 2, true);
  }
  const floatSamples = new Float32Array(int16Samples.length);
  for (let i = 0; i < int16Samples.length; i++) {
    floatSamples[i] = int16Samples[i] / 32768.0;
  }
  return createWavBlob(floatSamples, sampleRate);
}

/**
 * Generates audio synthesis via server API or local fallback
 */
export async function generateSpeechAudio(options: SpeechGenerateOptions): Promise<{
  audioUrl: string;
  blob: Blob;
  durationSeconds: number;
  source: 'ai' | 'fallback';
}> {
  const { text, voice, speed, pitch, volume, format } = options;

  try {
    // 1. Attempt high quality server-side Gemini AI generation
    const response = await fetch('https://vocalize-ai-backend.onrender.com/api/tts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voiceId: voice.id,
        voiceName: voice.name,
        accent: voice.accent,
        gender: voice.gender,
        geminiVoice: voice.geminiVoice,
        speed,
        pitch,
        volume,
        format,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.audioBase64) {
        const mimeType = format === 'mp3' ? 'audio/mp3' : 'audio/wav';
        let blob: Blob;
        if (data.isPcm) {
          blob = pcmBase64ToWavBlob(data.audioBase64, data.sampleRate || 24000);
        } else {
          const binary = window.atob(data.audioBase64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          blob = new Blob([bytes], { type: mimeType });
        }

        const audioUrl = URL.createObjectURL(blob);
        const duration = data.durationSeconds || Math.max(1, Math.round((text.length / 15) / speed));
        return { audioUrl, blob, durationSeconds: duration, source: 'ai' };
      }
    }
  } catch (err) {
    console.warn('Server TTS endpoint failed, switching to local audio synthesizer', err);
  }

  // 2. Local Fallback Synthesizer (Offline support)
  const syntheticBlob = await synthesizeOfflineAudio(text, speed, pitch, format);
  const audioUrl = URL.createObjectURL(syntheticBlob);
  const duration = Math.max(1, Math.round((text.length / 15) / speed));

  return {
    audioUrl,
    blob: syntheticBlob,
    durationSeconds: duration,
    source: 'fallback',
  };
}

/**
 * Generates an offline PCM audio WAV/MP3 blob using Web Audio API synthesis
 */
export async function synthesizeOfflineAudio(
  text: string,
  speed: number,
  pitch: number,
  format: 'mp3' | 'wav'
): Promise<Blob> {
  const sampleRate = 22050;
  // Estimated audio duration based on word count & speed
  const words = text.trim().split(/\s+/).length || 1;
  const durationInSeconds = Math.max(1.5, (words * 0.45) / speed);
  const numSamples = Math.floor(sampleRate * durationInSeconds);
  const samples = new Float32Array(numSamples);

  // Formant / tone generator simulating vocal cadence and pitch modulation
  const baseFreq = 120 * pitch;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Word rhythm modulation
    const wordRhythm = Math.sin(2 * Math.PI * (speed * 3.5) * t);
    const envelope = Math.max(0.1, 0.5 + 0.5 * wordRhythm);

    // Fundamental vocal frequency + harmonic formants
    const f1 = Math.sin(2 * Math.PI * baseFreq * t);
    const f2 = 0.5 * Math.sin(2 * Math.PI * (baseFreq * 2.05) * t);
    const f3 = 0.25 * Math.sin(2 * Math.PI * (baseFreq * 3.1) * t);

    // Subtle noise component for sibilants
    const sibilant = (Math.random() - 0.5) * 0.05 * (t % 0.3 < 0.05 ? 1 : 0);

    samples[i] = (f1 + f2 + f3 + sibilant) * 0.3 * envelope;
  }

  const mime = format === 'mp3' ? 'audio/mp3' : 'audio/wav';
  const wavBlob = createWavBlob(samples, sampleRate);
  return new Blob([await wavBlob.arrayBuffer()], { type: mime });
}

/**
 * Triggers native browser speech output for quick voice previews
 */
export function speakPreviewLocal(
  text: string,
  voiceProfile: VoiceProfile,
  speed = 1.0,
  pitch = 1.0
): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed * voiceProfile.defaultSpeed;
    utterance.pitch = pitch * voiceProfile.defaultPitch;
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Find matching US voice
      const usVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (voiceProfile.gender === 'Female' ? v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Google US English') : v.name.includes('Male') || v.name.includes('David') || v.name.includes('Alex'))
      ) || voices.find((v) => v.lang.startsWith('en-US')) || voices[0];

      if (usVoice) {
        utterance.voice = usVoice;
      }
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}
