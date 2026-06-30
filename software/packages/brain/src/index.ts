export type BrainIntent = 'welcome' | 'navigate' | 'entertain' | 'assist' | 'calm' | 'emergency' | 'unknown';
export type BrainRisk = 'normal' | 'elevated' | 'critical';
export type BrainActionKind = 'setSurfaceState' | 'setCompanionMode' | 'reduceMotion' | 'speak' | 'showMessage' | 'routeContent';

export interface BrainContext {
  intent: BrainIntent;
  risk: BrainRisk;
  driverAttention: 'parked' | 'lowLoad' | 'mediumLoad' | 'highLoad' | 'critical';
  vehicleState: 'parked' | 'driving';
  childPresent: boolean;
  availableSurfaces: string[];
}

export interface BrainAction {
  kind: BrainActionKind;
  target: string;
  value: string | number | boolean;
  reason: string;
}

export interface BrainDecision {
  intent: BrainIntent;
  risk: BrainRisk;
  confidence: number;
  summary: string;
  actions: BrainAction[];
  blockedActions: BrainAction[];
}

function confidenceFor(context: BrainContext): number {
  let score = 60;
  if (context.intent !== 'unknown') score += 15;
  if (context.availableSurfaces.length > 0) score += 10;
  if (context.risk === 'critical') score += 10;
  if (context.driverAttention === 'critical') score += 5;
  return Math.min(99, score);
}

export class AuraBrain {
  decide(context: BrainContext): BrainDecision {
    const actions: BrainAction[] = [];
    const blockedActions: BrainAction[] = [];

    if (context.risk === 'critical' || context.driverAttention === 'critical' || context.intent === 'emergency') {
      actions.push(
        { kind: 'setCompanionMode', target: 'companion', value: 'emergency', reason: 'Critical state requires emergency companion behaviour.' },
        { kind: 'reduceMotion', target: 'all', value: true, reason: 'Motion must be reduced during critical driver workload.' },
        { kind: 'setSurfaceState', target: 'dashboard', value: 'emergency', reason: 'Dashboard must prioritise safety-critical information.' },
        { kind: 'setSurfaceState', target: 'projection', value: 'off', reason: 'Projection visual motion is disabled in critical state.' },
        { kind: 'speak', target: 'companion', value: 'Emergency guidance active.', reason: 'Speech remains available for guidance.' },
      );
      blockedActions.push({ kind: 'routeContent', target: 'roof', value: 'entertainment', reason: 'Entertainment is blocked during critical state.' });

      return {
        intent: context.intent,
        risk: 'critical',
        confidence: confidenceFor(context),
        summary: 'Critical safety state. AURA switches to emergency guidance and disables distracting visuals.',
        actions,
        blockedActions,
      };
    }

    if (context.driverAttention === 'highLoad' || context.risk === 'elevated') {
      actions.push(
        { kind: 'setCompanionMode', target: 'companion', value: 'voiceOnly', reason: 'High driver workload requires reduced visual demand.' },
        { kind: 'reduceMotion', target: 'projection', value: true, reason: 'Projection motion should be reduced while driving workload is high.' },
        { kind: 'setSurfaceState', target: 'roof', value: 'ambient', reason: 'Roof should remain low-distraction.' },
      );
      blockedActions.push({ kind: 'showMessage', target: 'dashboard', value: 'nonCriticalPromotion', reason: 'Non-critical messages are blocked during elevated workload.' });

      return {
        intent: context.intent,
        risk: context.risk,
        confidence: confidenceFor(context),
        summary: 'Elevated workload. AURA reduces visual output and switches to voice-first assistance.',
        actions,
        blockedActions,
      };
    }

    if (context.intent === 'welcome') {
      actions.push(
        { kind: 'setCompanionMode', target: 'companion', value: context.childPresent ? 'friendly' : 'visual', reason: 'Welcome mode allows friendly visual interaction.' },
        { kind: 'setSurfaceState', target: 'floor', value: 'interactive', reason: 'Entry path can guide occupants.' },
        { kind: 'setSurfaceState', target: 'roof', value: 'ambient', reason: 'Roof ambience supports a premium welcome experience.' },
      );
    } else if (context.intent === 'entertain') {
      if (context.vehicleState === 'driving') {
        blockedActions.push({ kind: 'routeContent', target: 'dashboard', value: 'entertainment', reason: 'Entertainment cannot be routed to driver-visible surfaces while driving.' });
        actions.push({ kind: 'routeContent', target: 'rearCabin', value: 'entertainment', reason: 'Entertainment may be routed away from driver focus.' });
      } else {
        actions.push({ kind: 'routeContent', target: 'roof', value: 'entertainment', reason: 'Parked state allows immersive entertainment surfaces.' });
      }
    } else {
      actions.push(
        { kind: 'setCompanionMode', target: 'companion', value: 'assistive', reason: 'Default assistant behaviour should stay helpful and low distraction.' },
        { kind: 'showMessage', target: 'dashboard', value: 'Ready when you are.', reason: 'Default dashboard message is low risk.' },
      );
    }

    return {
      intent: context.intent,
      risk: context.risk,
      confidence: confidenceFor(context),
      summary: 'Normal state. AURA can provide helpful visual and assistive behaviours within surface constraints.',
      actions,
      blockedActions,
    };
  }
}

export function createAuraBrain(): AuraBrain {
  return new AuraBrain();
}
