export type DisplayRole = 'controller' | 'dashboard' | 'roof' | 'floor' | 'projection' | 'door' | 'rearCabin';
export type ContentPriority = 'low' | 'normal' | 'high' | 'critical';

export interface DisplayTarget {
  id: string;
  role: DisplayRole;
  name: string;
  available: boolean;
}

export interface ContentRequest {
  id: string;
  role: DisplayRole;
  contentType: string;
  priority: ContentPriority;
}

export interface DisplayRoute {
  requestId: string;
  displayId: string;
  contentType: string;
  priority: ContentPriority;
}

export class DisplayRouter {
  private readonly targets = new Map<string, DisplayTarget>();

  registerTarget(target: DisplayTarget): void {
    if (this.targets.has(target.id)) {
      throw new Error(`Display target already registered: ${target.id}`);
    }
    this.targets.set(target.id, target);
  }

  route(request: ContentRequest): DisplayRoute {
    const target = [...this.targets.values()].find((candidate) => candidate.role === request.role && candidate.available);
    if (!target) throw new Error(`No available display target for role: ${request.role}`);

    return {
      requestId: request.id,
      displayId: target.id,
      contentType: request.contentType,
      priority: request.priority,
    };
  }

  listTargets(): DisplayTarget[] {
    return [...this.targets.values()].sort((a, b) => a.id.localeCompare(b.id));
  }
}

export function createDisplayRouter(): DisplayRouter {
  return new DisplayRouter();
}
