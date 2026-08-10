/**
 * Audio conversion helpers for voice input. whisper-server consumes 16 kHz
 * mono PCM16 WAV natively, so the webview encodes the raw samples captured by
 * SpeechRecorder before uploading — keeping the helper free of ffmpeg or any
 * decoding dependency.
 */

import type { PcmCapture } from "./recorder";

export const WHISPER_SAMPLE_RATE = 16000;

/** Encodes captured samples as base64 16 kHz mono PCM16 WAV. */
export async function pcmToWavBase64(
  capture: Pick<PcmCapture, "samples" | "sampleRate">,
): Promise<string> {
  const samples =
    capture.sampleRate === WHISPER_SAMPLE_RATE
      ? capture.samples
      : await resampleSamples(capture.samples, capture.sampleRate, WHISPER_SAMPLE_RATE);
  return arrayBufferToBase64(encodeWavPcm16(samples, WHISPER_SAMPLE_RATE));
}

/** Encodes mono float samples as a PCM16 WAV file. */
export function encodeWavPcm16(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const dataBytes = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buffer);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataBytes, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeAscii(view, 36, "data");
  view.setUint32(40, dataBytes, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
  return buffer;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function resampleSamples(
  samples: Float32Array,
  fromRate: number,
  toRate: number,
): Promise<Float32Array> {
  if (samples.length === 0) return samples;
  const source = new AudioBuffer({
    length: samples.length,
    numberOfChannels: 1,
    sampleRate: fromRate,
  });
  // Captured samples always sit on a plain ArrayBuffer; the assertion satisfies
  // TypeScript's SharedArrayBuffer-aware typed-array generics.
  source.copyToChannel(samples as Float32Array<ArrayBuffer>, 0);
  const length = Math.max(1, Math.ceil((samples.length / fromRate) * toRate));
  const offline = new OfflineAudioContext(1, length, toRate);
  const node = offline.createBufferSource();
  node.buffer = source;
  node.connect(offline.destination);
  node.start();
  const rendered = await offline.startRendering();
  return rendered.getChannelData(0).slice();
}

function writeAscii(view: DataView, offset: number, text: string): void {
  for (let i = 0; i < text.length; i++) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}
