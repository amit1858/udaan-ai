/** Ephemeral recording conversion only. Audio is never persisted in browser storage. */
export function samplesToWav(samples: Float32Array): ArrayBuffer {
  const length = Math.min(samples.length, 160000);
  if (length < 160) throw new Error('No usable audio recorded. Hold the microphone for at least a moment.');
  const buffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(buffer);
  const ascii = (at: number, value: string) => [...value].forEach((c, i) => view.setUint8(at + i, c.charCodeAt(0)));
  ascii(0, 'RIFF'); view.setUint32(4, 36 + length * 2, true); ascii(8, 'WAVE');
  ascii(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, 1, true); view.setUint32(24, 16000, true); view.setUint32(28, 32000, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true); ascii(36, 'data'); view.setUint32(40, length * 2, true);
  for (let i = 0; i < length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, sample < 0 ? sample * 32768 : sample * 32767, true);
  }
  return buffer;
}
export async function encodeRecording(blob: Blob): Promise<Blob> {
  if (blob.size === 0 || blob.size > 2000000) throw new Error('Recording is empty or too large. Record up to ten seconds.');
  const context = new AudioContext();
  try {
    const decoded = await context.decodeAudioData(await blob.arrayBuffer());
    const frames = Math.min(160000, Math.floor(decoded.duration * 16000));
    if (frames < 160) throw new Error('No usable audio recorded.');
    const offline = new OfflineAudioContext(1, frames, 16000);
    const source = offline.createBufferSource(); source.buffer = decoded; source.connect(offline.destination); source.start();
    const rendered = await offline.startRendering();
    return new Blob([samplesToWav(rendered.getChannelData(0))], { type: 'application/octet-stream' });
  } finally { await context.close(); }
}
export function audioUrl(base64: string, mime = 'audio/wav'): string {
  if (mime !== 'audio/wav' || base64.length > 6000000) throw new Error('Unsupported or oversized speech audio.');
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return URL.createObjectURL(new Blob([bytes], { type: mime }));
}
