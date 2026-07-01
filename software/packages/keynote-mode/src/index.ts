import { type ExperienceScene } from '@aura-dcos/experience-director';

export interface KeynoteRunInput {
  scenes: ExperienceScene[];
  completedSceneIds: string[];
  openedOutputs: string[];
  safetyChecks: number;
  voiceChecks: number;
  integrationChecks: number;
  droppedFrames?: number;
  errors?: number;
}

export interface KeynoteScore {
  score: number;
  ready: boolean;
  summary: string;
  metrics: {
    sceneCoverage: number;
    outputCoverage: number;
    safetyChecks: number;
    voiceChecks: number;
    integrationChecks: number;
    reliability: number;
  };
  recommendations: string[];
}

export class AuraKeynoteMode {
  scoreRun(input: KeynoteRunInput): KeynoteScore {
    const requiredOutputs = ['dashboard', 'roof', 'projection', 'floor'];
    const sceneCoverage = input.scenes.length === 0 ? 0 : input.completedSceneIds.length / input.scenes.length;
    const outputCoverage = requiredOutputs.filter((output) => input.openedOutputs.includes(output)).length / requiredOutputs.length;
    const safetyScore = Math.min(1, input.safetyChecks / 2);
    const voiceScore = Math.min(1, input.voiceChecks / 2);
    const integrationScore = Math.min(1, input.integrationChecks / 1);
    const reliability = Math.max(0, 1 - ((input.errors ?? 0) * 0.2) - ((input.droppedFrames ?? 0) * 0.01));
    const score = Math.round((sceneCoverage * 30) + (outputCoverage * 25) + (safetyScore * 15) + (voiceScore * 10) + (integrationScore * 10) + (reliability * 10));
    const recommendations: string[] = [];

    if (sceneCoverage < 1) recommendations.push('Complete every Experience Director scene.');
    if (outputCoverage < 1) recommendations.push('Open dashboard, roof, projection and floor outputs before demo.');
    if (safetyScore < 1) recommendations.push('Run at least two safety checks.');
    if (voiceScore < 1) recommendations.push('Run safe and unsafe voice prompts.');
    if (integrationScore < 1) recommendations.push('Run Vehicle Integration Framework scan.');
    if (reliability < 0.9) recommendations.push('Reduce browser load or close unused tabs before customer demo.');

    return {
      score,
      ready: score >= 90,
      summary: score >= 90 ? 'Keynote mode is customer-demo ready.' : 'Keynote mode needs final demo checks.',
      metrics: { sceneCoverage, outputCoverage, safetyChecks: input.safetyChecks, voiceChecks: input.voiceChecks, integrationChecks: input.integrationChecks, reliability },
      recommendations,
    };
  }
}

export function createAuraKeynoteMode(): AuraKeynoteMode {
  return new AuraKeynoteMode();
}
