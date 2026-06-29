export type AnimationEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';

export interface AnimationInstruction {
  id: string;
  target: string;
  property: string;
  from: number;
  to: number;
  durationMs: number;
  delayMs: number;
  easing: AnimationEasing;
}

export interface AnimationFrameValue {
  instructionId: string;
  target: string;
  property: string;
  value: number;
}

function ease(progress: number, easing: AnimationEasing): number {
  if (easing === 'easeIn') return progress * progress;
  if (easing === 'easeOut') return 1 - (1 - progress) * (1 - progress);
  if (easing === 'easeInOut') return progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  return progress;
}

export class AnimationEngine {
  frameAt(instruction: AnimationInstruction, elapsedMs: number): AnimationFrameValue {
    const activeMs = Math.max(0, elapsedMs - instruction.delayMs);
    const progress = instruction.durationMs === 0 ? 1 : Math.min(1, activeMs / instruction.durationMs);
    const eased = ease(progress, instruction.easing);
    const value = instruction.from + (instruction.to - instruction.from) * eased;

    return {
      instructionId: instruction.id,
      target: instruction.target,
      property: instruction.property,
      value,
    };
  }

  timelineAt(instructions: AnimationInstruction[], elapsedMs: number): AnimationFrameValue[] {
    return instructions.map((instruction) => this.frameAt(instruction, elapsedMs));
  }
}

export function createAnimationEngine(): AnimationEngine {
  return new AnimationEngine();
}
