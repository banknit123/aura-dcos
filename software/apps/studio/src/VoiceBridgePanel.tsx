import { useMemo, useState } from 'react';
import {
  createAuraVoiceBridge,
  type SafeVoiceResponse,
  type TextToSpeechAdapter,
  type SpeechSynthesisRequest,
  type SpeechSynthesisResult,
  type VoiceTurnResult,
} from '@aura-dcos/voice-bridge';
import type { DriverAttentionState } from '@aura-dcos/companion';
import type { AuraCabinContext } from '@aura-dcos/digital-twin';
import './voice.css';

interface VoiceBridgePanelProps {
  context: AuraCabinContext;
  risk: 'normal' | 'elevated' | 'critical';
  driverAttention: DriverAttentionState;
  onSafeResponse: (response: SafeVoiceResponse) => void;
}

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

interface BrowserSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface BrowserSpeechRecognitionEvent {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: {
      transcript: string;
      confidence: number;
    };
  }>;
}

interface BrowserSpeechRecognitionErrorEvent {
  error: string;
}

interface BrowserVoiceWindow extends Window {
  SpeechRecognition?: BrowserSpeechRecognitionConstructor;
  webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
}

class BrowserTextToSpeechAdapter implements TextToSpeechAdapter {
  readonly kind = 'browser' as const;

  async speak(request: SpeechSynthesisRequest): Promise<SpeechSynthesisResult> {
    if (request.mode === 'silent' || request.mode === 'textOnly') {
      return {
        queued: false,
        spokenText: request.text,
        reason: 'Speech skipped because the safe output mode is text-only or silent.',
      };
    }

    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      return {
        queued: false,
        spokenText: request.text,
        reason: 'Browser speech synthesis is not available in this environment.',
      };
    }

    const utterance = new SpeechSynthesisUtterance(request.text);
    utterance.lang = request.locale;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);

    return {
      queued: true,
      spokenText: request.text,
      reason: 'Safe response queued through browser text-to-speech.',
    };
  }
}

function speechRecognitionConstructor(): BrowserSpeechRecognitionConstructor | undefined {
  const browserWindow = window as BrowserVoiceWindow;
  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;
}

function browserVoiceAvailable(): boolean {
  return typeof window !== 'undefined' && Boolean(speechRecognitionConstructor());
}

export function VoiceBridgePanel({ context, risk, driverAttention, onSafeResponse }: VoiceBridgePanelProps) {
  const bridge = useMemo(() => createAuraVoiceBridge({ textToSpeech: new BrowserTextToSpeechAdapter() }), []);
  const [prompt, setPrompt] = useState('Can you help me with the cabin?');
  const [response, setResponse] = useState<SafeVoiceResponse | null>(null);
  const [turn, setTurn] = useState<VoiceTurnResult | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState(browserVoiceAvailable() ? 'Browser voice ready.' : 'Browser speech recognition is not available. Typed prompt mode is ready.');

  const bridgeContext = {
    vehicleState: context.vehicleState,
    driverAttention,
    risk,
  };

  async function processTranscript(transcript: string, source: 'typed' | 'microphone' | 'wakeWord'): Promise<void> {
    const cleanTranscript = transcript.trim();
    if (!cleanTranscript) {
      setVoiceStatus('No prompt detected. Please type or speak a command.');
      return;
    }

    setVoiceStatus('Processing through AURA Voice Bridge safety gate...');
    const result = await bridge.runTextTurn({ source, transcript: cleanTranscript, locale: 'en-AU' }, bridgeContext);
    setPrompt(cleanTranscript);
    setResponse(result.safeResponse);
    setTurn(result);
    setVoiceStatus(result.speech?.reason ?? 'Safe response prepared.');
    onSafeResponse(result.safeResponse);
  }

  function startBrowserVoice(): void {
    const Recognition = speechRecognitionConstructor();
    if (!Recognition) {
      setVoiceStatus('Browser speech recognition is not supported here. Use typed prompt mode.');
      return;
    }

    const recognition = new Recognition();
    recognition.lang = 'en-AU';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const result = event.results[event.resultIndex];
      const transcript = result?.[0]?.transcript ?? '';
      setListening(false);
      void processTranscript(transcript, 'microphone');
    };

    recognition.onerror = (event) => {
      setListening(false);
      setVoiceStatus(`Voice input error: ${event.error}. Typed prompt mode remains available.`);
    };

    recognition.onend = () => setListening(false);

    setListening(true);
    setVoiceStatus('Listening for one AURA voice command...');
    recognition.start();
  }

  return (
    <section className="voice-panel">
      <h2>Voice + LLM Bridge</h2>
      <p className="muted">Browser voice input and speech output are routed through the AURA safety gate before reaching cabin outputs.</p>

      <textarea value={prompt} onChange={(event) => setPrompt(event.currentTarget.value)} rows={3} />
      <div className="voice-actions">
        <button onClick={() => void processTranscript(prompt, 'typed')}>Process Prompt Safely</button>
        <button onClick={startBrowserVoice} disabled={listening}>{listening ? 'Listening...' : 'Push to Talk'}</button>
      </div>
      <small className="voice-status">{voiceStatus}</small>

      {response ? (
        <article className={`voice-response voice-${response.safety}`}>
          <strong>{response.safety} · {response.outputMode}</strong>
          <p>{response.text}</p>
          <small>{response.reason}</small>
        </article>
      ) : null}

      {turn ? (
        <article className="voice-trace">
          <strong>Voice turn trace</strong>
          <p>LLM provider: mock · TTS provider: browser · Safety mode: {turn.request.safetyMode}</p>
          <small>Prompt: {turn.request.prompt}</small>
        </article>
      ) : null}
    </section>
  );
}
