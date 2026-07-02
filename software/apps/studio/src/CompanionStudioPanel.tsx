import { useMemo, useState } from 'react';
import { createAuraCompanionStudio, type CompanionStudioDraft, type CompanionStudioPersonaId, type CompanionVoiceStyle, type CompanionAnimationStyle } from '@aura-dcos/companion-studio';
import { type CompanionState, type DriverAttentionState } from '@aura-dcos/companion';

interface CompanionStudioPanelProps {
  driverAttention: DriverAttentionState;
  childPresent: boolean;
  onCompanionState: (state: CompanionState) => void;
  onEvent?: (type: string, message: string) => void;
}

const voiceStyles: CompanionVoiceStyle[] = ['warm', 'calm', 'premium', 'playful', 'focused', 'urgent'];
const animationStyles: CompanionAnimationStyle[] = ['orb', 'constellation', 'softAvatar', 'minimalPulse', 'friendlyMascot', 'safetyBeacon'];

export function CompanionStudioPanel({ driverAttention, childPresent, onCompanionState, onEvent }: CompanionStudioPanelProps) {
  const studio = useMemo(() => createAuraCompanionStudio(), []);
  const personas = useMemo(() => studio.listPersonas(), [studio]);
  const [personaId, setPersonaId] = useState<CompanionStudioPersonaId>('auraDefault');
  const [draft, setDraft] = useState<CompanionStudioDraft>(() => studio.createDraft('auraDefault'));
  const preview = useMemo(() => studio.preview(draft, driverAttention, childPresent), [childPresent, draft, driverAttention, studio]);

  function selectPersona(nextPersonaId: CompanionStudioPersonaId): void {
    const nextDraft = studio.createDraft(nextPersonaId);
    setPersonaId(nextPersonaId);
    setDraft(nextDraft);
    onEvent?.('companion-studio.persona.selected', `${nextDraft.displayName} selected in Companion Studio.`);
  }

  function updateDraft(update: Partial<CompanionStudioDraft>): void {
    setDraft((current) => ({ ...current, ...update }));
  }

  function publish(): void {
    onCompanionState(preview.state);
    onEvent?.('companion-studio.preview.published', `${preview.state.name} published to AURA projection with ${preview.validation.safe ? 'safe' : 'review-needed'} configuration.`);
  }

  return (
    <section className="companion-studio-panel">
      <div className="companion-studio-header">
        <div>
          <p className="eyebrow">Studio v2 · Sprint 4</p>
          <h2>Companion Studio</h2>
          <p className="muted">Personality, voice, animation, safety validation and marketplace-ready companion metadata.</p>
        </div>
        <button onClick={publish}>Publish Companion</button>
      </div>

      <select value={personaId} onChange={(event) => selectPersona(event.target.value as CompanionStudioPersonaId)}>
        {personas.map((persona) => <option key={persona.id} value={persona.id}>{persona.name} · {persona.role}</option>)}
      </select>

      <div className="companion-studio-grid">
        <article>
          <strong>Personality Editor</strong>
          <label>
            Display name
            <input value={draft.displayName} onChange={(event) => updateDraft({ displayName: event.target.value })} />
          </label>
          <label>
            Greeting
            <textarea value={draft.customGreeting ?? ''} onChange={(event) => updateDraft({ customGreeting: event.target.value })} />
          </label>
          <small>{preview.persona.description}</small>
        </article>

        <article>
          <strong>Voice Editor</strong>
          <label>
            Voice style
            <select value={draft.voice.style} onChange={(event) => updateDraft({ voice: { ...draft.voice, style: event.target.value as CompanionVoiceStyle } })}>
              {voiceStyles.map((style) => <option key={style} value={style}>{style}</option>)}
            </select>
          </label>
          <label>
            Warmth {draft.voice.warmth}
            <input type="range" min="0" max="100" value={draft.voice.warmth} onChange={(event) => updateDraft({ voice: { ...draft.voice, warmth: Number(event.target.value) } })} />
          </label>
          <label>
            Clarity {draft.voice.clarity}
            <input type="range" min="0" max="100" value={draft.voice.clarity} onChange={(event) => updateDraft({ voice: { ...draft.voice, clarity: Number(event.target.value) } })} />
          </label>
        </article>

        <article>
          <strong>Animation Editor</strong>
          <label>
            Animation style
            <select value={draft.animation.style} onChange={(event) => updateDraft({ animation: { ...draft.animation, style: event.target.value as CompanionAnimationStyle } })}>
              {animationStyles.map((style) => <option key={style} value={style}>{style}</option>)}
            </select>
          </label>
          <label>
            Motion {draft.animation.motionLevel}
            <input type="range" min="0" max="100" value={draft.animation.motionLevel} onChange={(event) => updateDraft({ animation: { ...draft.animation, motionLevel: Number(event.target.value) } })} />
          </label>
          <label>
            Expressiveness {draft.animation.expressiveness}
            <input type="range" min="0" max="100" value={draft.animation.expressiveness} onChange={(event) => updateDraft({ animation: { ...draft.animation, expressiveness: Number(event.target.value) } })} />
          </label>
        </article>

        <article className={preview.validation.safe ? 'ready' : 'degraded'}>
          <strong>Live Preview</strong>
          <div className={`companion-preview-orb companion-${preview.state.mood}`}>{preview.state.name.slice(0, 1)}</div>
          <span>{preview.state.mode} · {preview.state.mood} · motion {preview.state.animationLevel}%</span>
          <p>{preview.state.message}</p>
          <small>{preview.marketplace.listingTitle}</small>
          <small>{preview.marketplace.safetyBadge}</small>
        </article>
      </div>

      {preview.validation.warnings.length > 0 && (
        <div className="companion-studio-warnings">
          {preview.validation.warnings.map((warning) => <small key={warning}>{warning}</small>)}
        </div>
      )}
    </section>
  );
}
