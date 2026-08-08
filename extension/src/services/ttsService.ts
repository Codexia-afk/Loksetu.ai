export function speakText(text: string, lang: 'en-IN' | 'bn-IN' | 'hi-IN' = 'en-IN'): boolean {
  if (!('speechSynthesis' in window)) {
    console.warn('Web Speech API is not supported in this browser.');
    return false;
  }

  window.speechSynthesis.cancel(); // Stop any ongoing speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
