export interface PcmCapture {
  samples: Float32Array;
  sampleRate: number;
  durationMs: number;
}

/**
 * Microphone capture as raw PCM via WebAudio. MediaRecorder is deliberately
 * not used: its containers (webm on Chromium, mp4 on WebKit) are not what the
 * whisper sidecar ingests, while raw samples encode straight to the 16 kHz
 * WAV it expects.
 *
 * One recording at a time; the microphone is released on stop or cancel.
 */
export class SpeechRecorder {
  #context: AudioContext | null = null;
  #stream: MediaStream | null = null;
  #source: MediaStreamAudioSourceNode | null = null;
  #processor: ScriptProcessorNode | null = null;
  #analyser: AnalyserNode | null = null;
  // Explicit ArrayBuffer generic: getByteTimeDomainData rejects the default
  // Uint8Array<ArrayBufferLike> under TS 5.7+ typed-array generics.
  #levelBuffer: Uint8Array<ArrayBuffer> | null = null;
  #mute: GainNode | null = null;
  #chunks: Float32Array[] = [];
  #startedAt = 0;

  static supported(): boolean {
    return (
      typeof navigator !== "undefined" &&
      typeof AudioContext !== "undefined" &&
      Boolean(navigator.mediaDevices?.getUserMedia)
    );
  }

  get recording(): boolean {
    return this.#context !== null;
  }

  async start(): Promise<void> {
    if (this.#context) {
      throw new Error("a recording is already in progress");
    }
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    });
    const context = createCaptureContext();
    if (context.state === "suspended") {
      await context.resume();
    }
    const source = context.createMediaStreamSource(stream);
    // ScriptProcessorNode is deprecated but universally available (including
    // WKWebView); an AudioWorklet would need module loading for no gain here.
    const processor = context.createScriptProcessor(4096, 1, 1);
    processor.onaudioprocess = (event) => {
      this.#chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
    };
    // The processor only runs while connected to the destination; keep the
    // graph silent with a zero-gain node.
    const mute = context.createGain();
    mute.gain.value = 0;
    source.connect(processor);
    processor.connect(mute);
    mute.connect(context.destination);
    // Feeds the live level meter; a 1024-sample window is ~64ms at 16 kHz,
    // matching the cadence the waveform UI polls at.
    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);

    this.#stream = stream;
    this.#context = context;
    this.#source = source;
    this.#processor = processor;
    this.#analyser = analyser;
    this.#mute = mute;
    this.#chunks = [];
    this.#startedAt = performance.now();
  }

  /**
   * Instantaneous microphone level in [0, 1] (RMS of the analyser's current
   * window), or 0 when not recording. Cheap enough to poll from UI timers.
   * Uses the byte variant for WKWebView compatibility.
   */
  level(): number {
    const analyser = this.#analyser;
    if (!analyser) return 0;
    const buffer = (this.#levelBuffer ??= new Uint8Array(analyser.fftSize));
    analyser.getByteTimeDomainData(buffer);
    let sum = 0;
    for (const value of buffer) {
      const centered = (value - 128) / 128;
      sum += centered * centered;
    }
    return Math.sqrt(sum / buffer.length);
  }

  async stop(): Promise<PcmCapture> {
    const context = this.#context;
    if (!context) {
      throw new Error("no recording in progress");
    }
    const capture: PcmCapture = {
      samples: concatChunks(this.#chunks),
      sampleRate: context.sampleRate,
      durationMs: performance.now() - this.#startedAt,
    };
    await this.#release();
    return capture;
  }

  cancel(): void {
    void this.#release();
  }

  async #release(): Promise<void> {
    this.#processor?.disconnect();
    this.#analyser?.disconnect();
    this.#source?.disconnect();
    this.#mute?.disconnect();
    if (this.#processor) this.#processor.onaudioprocess = null;
    this.#stream?.getTracks().forEach((track) => track.stop());
    const context = this.#context;
    this.#context = null;
    this.#stream = null;
    this.#source = null;
    this.#processor = null;
    this.#analyser = null;
    this.#levelBuffer = null;
    this.#mute = null;
    this.#chunks = [];
    if (context && context.state !== "closed") {
      await context.close().catch(() => {});
    }
  }
}

/**
 * Prefer capturing at whisper's 16 kHz directly; engines that reject the rate
 * fall back to their native rate and the WAV encoder resamples later.
 */
function createCaptureContext(): AudioContext {
  try {
    return new AudioContext({ sampleRate: 16000 });
  } catch {
    return new AudioContext();
  }
}

function concatChunks(chunks: readonly Float32Array[]): Float32Array {
  let length = 0;
  for (const chunk of chunks) length += chunk.length;
  const merged = new Float32Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}
