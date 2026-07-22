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
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
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
    floatSamples[i] = int16Samples[i] / 32768;
  }

  return createWavBlob(floatSamples, sampleRate);
}

export async function generateSpeechAudio(options: SpeechGenerateOptions): Promise<{
  audioUrl: string;
  blob: Blob;
  durationSeconds: number;
  source: 'ai' | 'fallback';
}> {

  const { text, voice, speed, pitch, volume, format } = options;

  try {
    const response = await fetch("https://vocalize-ai-backend.onrender.com/api/tts/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

    if (!response.ok) {
      const errorText = await response.text();
      alert(`Server Error ${response.status}\n${errorText}`);
      throw new Error(errorText);
    }

    const data = await response.json();

    if (!data.audioBase64) {
      throw new Error("No audio returned from server");
    }

    let blob: Blob;

    if (data.isPcm) {
      blob = pcmBase64ToWavBlob(
        data.audioBase64,
        data.sampleRate || 24000
      );
    } else {
      const binary = window.atob(data.audioBase64);
      const bytes = new Uint8Array(binary.length);

      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      blob = new Blob([bytes], {
        type: format === "mp3" ? "audio/mp3" : "audio/wav",
      });
    }

    return {
      audioUrl: URL.createObjectURL(blob),
      blob,
      durationSeconds:
        data.durationSeconds ||
        Math.max(1, Math.round((text.length / 15) / speed)),
      source: "ai",
    };

  } catch (err) {
    console.error("TTS ERROR:", err);
    alert(
      "TTS Error:\n" +
      (err instanceof Error ? err.message : JSON.stringify(err))
    );

    return Promise.reject(err);
  }
}

/**
 * Offline synthesizer
 */
export async function synthesizeOfflineAudio(
  text: string,
  speed: number,
  pitch: number,
  format: 'mp3' | 'wav'
): Promise<Blob> {

  const sampleRate = 22050;
  const words = text.trim().split(/\s+/).length || 1;
  const duration = Math.max(1.5, (words * 0.45) / speed);

  const numSamples = Math.floor(sampleRate * duration);
  const samples = new Float32Array(numSamples);

  const baseFreq = 120 * pitch;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;

    samples[i] =
      (
        Math.sin(2 * Math.PI * baseFreq * t) +
        0.5 * Math.sin(2 * Math.PI * baseFreq * 2 * t)
      ) * 0.3;
  }

  const wavBlob = createWavBlob(samples, sampleRate);

  return new Blob(
    [await wavBlob.arrayBuffer()],
    {
      type: format === "mp3" ? "audio/mp3" : "audio/wav",
    }
  );
}

export function speakPreviewLocal(
  text: string,
  voiceProfile: VoiceProfile,
  speed = 1,
  pitch = 1
): Promise<void> {

  return new Promise((resolve) => {

    if (!("speechSynthesis" in window)) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = speed * voiceProfile.defaultSpeed;
    utterance.pitch = pitch * voiceProfile.defaultPitch;
    utterance.lang = "en-US";

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}