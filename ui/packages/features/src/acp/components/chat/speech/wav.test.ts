import { describe, expect, it } from "vitest";
import { arrayBufferToBase64, encodeWavPcm16, WHISPER_SAMPLE_RATE } from "./wav";

function ascii(view: DataView, offset: number, length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += String.fromCharCode(view.getUint8(offset + i));
  }
  return out;
}

describe("encodeWavPcm16", () => {
  it("writes a valid mono PCM16 WAV header", () => {
    const samples = new Float32Array([0, 0.5, -0.5, 1]);
    const view = new DataView(encodeWavPcm16(samples, WHISPER_SAMPLE_RATE));

    expect(ascii(view, 0, 4)).toBe("RIFF");
    expect(ascii(view, 8, 4)).toBe("WAVE");
    expect(ascii(view, 12, 4)).toBe("fmt ");
    expect(ascii(view, 36, 4)).toBe("data");
    expect(view.getUint32(4, true)).toBe(36 + samples.length * 2);
    expect(view.getUint16(20, true)).toBe(1); // PCM
    expect(view.getUint16(22, true)).toBe(1); // mono
    expect(view.getUint32(24, true)).toBe(WHISPER_SAMPLE_RATE);
    expect(view.getUint32(28, true)).toBe(WHISPER_SAMPLE_RATE * 2);
    expect(view.getUint16(34, true)).toBe(16); // bits per sample
    expect(view.getUint32(40, true)).toBe(samples.length * 2);
  });

  it("converts float samples to little-endian int16", () => {
    const view = new DataView(encodeWavPcm16(new Float32Array([0, 1, -1]), 16000));

    expect(view.getInt16(44, true)).toBe(0);
    expect(view.getInt16(46, true)).toBe(0x7fff);
    expect(view.getInt16(48, true)).toBe(-0x8000);
  });

  it("clamps out-of-range samples instead of wrapping", () => {
    const view = new DataView(encodeWavPcm16(new Float32Array([2, -2]), 16000));

    expect(view.getInt16(44, true)).toBe(0x7fff);
    expect(view.getInt16(46, true)).toBe(-0x8000);
  });
});

describe("arrayBufferToBase64", () => {
  it("round-trips bytes through base64", () => {
    const bytes = new Uint8Array([0, 1, 2, 250, 255]);
    const encoded = arrayBufferToBase64(bytes.buffer);

    expect(atob(encoded)).toBe(String.fromCharCode(...bytes));
  });

  it("handles buffers larger than one encoding chunk", () => {
    const bytes = new Uint8Array(70_000).fill(65);
    const encoded = arrayBufferToBase64(bytes.buffer);

    expect(atob(encoded)).toHaveLength(bytes.length);
  });
});
