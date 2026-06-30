import { useMemo, useState } from 'react';
import { createAuraVoiceBridge, type SafeVoiceResponse } from '@aura-dcos/voice-bridge';
import type { DriverAttentionState } from '@aura-dcos/companion';
import type { AuraCabinContext } from '@aura-dcos/digital-twin';
import './voice.css';

interface VoiceBridgePanelProps {
  context: AuraCabinContext;
  risk: 'normal' | 'elevated' | 'critical';
  driverAttention: DriverAttentionState;
  onSafeResponse: (response: SafeVoiceResponse) => void;
}

export function VoiceBridgePanel({ context, risk, driverAttention, onSafeResponse }: VoiceBridgePanelProps) {
  const bridge = useMemo(() => createAuraVoiceBridge(), []);
  const [prompt, setPrompt] = useState('Can you help me with the cabin?');
  const [response, setResponse] = useState<SafeVoiceResponse | null>(null);

  function runPrompt(): void {
    const request = bridge.createRequest({ source: 'typed', transcript: prompt, locale: 'en-AU' }, {
      vehicleState: context.vehicleState,
      driverAttention,
      risk,
    });

    const mockModelResponse = {
      text: `AURA processed: ${request.prompt}. Safety mode is ${request.safetyMode}.`,
      confidence: 88,
    };

    const safe = bridge.gateResponse(mockModelResponse, {
      vehicleState: context.vehicleState,
      driverAttention,
      risk,
    });

    setResponse(safe);
    onSafeResponse(safe);
  }

  return (
    <section className="voice-panel">
      <h2>Voice + LLM Bridge</h2>
      <p className="muted">Prototype prompt flow with AURA Brain-style safety gating.</p>

      <textarea value={prompt} onChange={(event) => setPrompt(event.currentTarget.value)} rows={3} />
      <button onClick={runPrompt}>Process Prompt Safely</button>

      {response ? (
        <article className={`voice-response voice-${response.safety}`}>
          <strong>{response.safety} · {response.outputMode}</strong>
          <p>{response.text}</p>
          <small>{response.reason}</small>
        </article>
      ) : null}
    </section>
  );
}
