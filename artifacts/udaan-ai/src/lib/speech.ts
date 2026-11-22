import { useSyncExternalStore } from 'react';

let current: string | null = null;
const played = new Set<string>();
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

export function stopSpeech() {
  if (speechSupported) window.speechSynthesis.cancel();
  current = null;
  emit();
}

export function speak(id: string, text: string, lang: string) {
  if (!speechSupported) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  const voices = window.speechSynthesis.getVoices();
  const v = voices.find((x) => x.lang === lang) ?? voices.find((x) => x.lang.startsWith(lang.slice(0, 2)));
  if (v) u.voice = v;
  u.rate = 0.95;
  u.onend = u.onerror = () => { if (current === id) { current = null; emit(); } };
  current = id;
  played.add(id);
  emit();
  window.speechSynthesis.speak(u);
}

export function useSpeaking() {
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => current, () => null);
}
export const hasPlayed = (id: string) => played.has(id);
