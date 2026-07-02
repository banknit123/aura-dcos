import { describe, expect, it } from 'vitest';
import { createAuraCompanionSafetyValidator, createAuraCompanionStudio } from './index';

describe('Studio v2 Sprint 4 Companion Studio', () => {
  it('registers production companion personas', () => {
    const studio = createAuraCompanionStudio();
    const ids = studio.listPersonas().map((persona) => persona.id);

    expect(ids).toContain('auraDefault');
    expect(ids).toContain('luxuryConcierge');
    expect(ids).toContain('familyBuddy');
    expect(ids).toContain('wellnessCoach');
    expect(ids).toContain('productivityCopilot');
    expect(ids).toContain('safetyGuardian');
  });

  it('creates editable persona drafts with voice and animation profiles', () => {
    const studio = createAuraCompanionStudio();
    const draft = studio.createDraft('wellnessCoach');

    expect(draft.displayName).toBe('AURA Wellness');
    expect(draft.voice.style).toBe('calm');
    expect(draft.animation.style).toBe('orb');
  });

  it('generates live companion preview state', () => {
    const studio = createAuraCompanionStudio();
    const draft = studio.createDraft('familyBuddy');
    const preview = studio.preview(draft, 'parked', true);

    expect(preview.state.name).toBe('AURA Buddy');
    expect(preview.state.mood).toBe('friendly');
    expect(preview.marketplace.status).toBe('oemReady');
  });

  it('forces high-load previews to voice-only low-motion behavior', () => {
    const studio = createAuraCompanionStudio();
    const draft = studio.createDraft('luxuryConcierge');
    const preview = studio.preview(draft, 'highLoad', false);

    expect(preview.state.mode).toBe('voiceOnly');
    expect(preview.state.animationLevel).toBe(0);
    expect(preview.state.allowVisualMotion).toBe(false);
  });

  it('warns when custom settings are unsafe for critical driver attention', () => {
    const studio = createAuraCompanionStudio();
    const validator = createAuraCompanionSafetyValidator();
    const draft = studio.createDraft('familyBuddy');
    draft.animation.motionLevel = 90;
    draft.animation.driverVisibleAllowed = true;
    draft.voice.interruptionPolicy = 'softInterrupt';

    const validation = validator.validate(draft, 'critical');

    expect(validation.safe).toBe(false);
    expect(validation.warnings.length).toBeGreaterThanOrEqual(2);
  });
});
