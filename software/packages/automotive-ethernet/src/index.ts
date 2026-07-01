export type EthernetLinkState = 'down' | 'up' | 'degraded';
export type EthernetServiceProtocol = 'someip' | 'dds' | 'http' | 'rtsp' | 'raw-udp' | 'raw-tcp';
export type EthernetQoSClass = 'control' | 'diagnostic' | 'media' | 'sensor-stream' | 'best-effort';
export type EthernetPayload = Uint8Array | string | Record<string, string | number | boolean>;

export interface EthernetEndpoint {
  id: string;
  host: string;
  port: number;
  vlanId?: number;
  macAddress?: string;
}

export interface EthernetServiceDescriptor {
  id: string;
  name: string;
  protocol: EthernetServiceProtocol;
  endpoint: EthernetEndpoint;
  qos: EthernetQoSClass;
  secure: boolean;
  bandwidthMbps?: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface EthernetMessage {
  serviceId: string;
  payload: EthernetPayload;
  timestamp: string;
  correlationId?: string;
}

export interface EthernetTransportResult {
  accepted: boolean;
  serviceId: string;
  reason: string;
  correlationId?: string;
}

export interface EthernetTransport {
  open(): Promise<void> | void;
  close(): Promise<void> | void;
  publish(service: EthernetServiceDescriptor, message: EthernetMessage): Promise<EthernetTransportResult> | EthernetTransportResult;
  request(service: EthernetServiceDescriptor, message: EthernetMessage): Promise<EthernetMessage> | EthernetMessage;
}

export interface EthernetHealthSnapshot {
  linkState: EthernetLinkState;
  services: EthernetServiceDescriptor[];
  publishedMessages: number;
  failedMessages: number;
  messages: string[];
}

function now(): string {
  return new Date().toISOString();
}

function validateEndpoint(endpoint: EthernetEndpoint): void {
  if (!endpoint.id.trim()) throw new Error('Ethernet endpoint id is required');
  if (!endpoint.host.trim()) throw new Error('Ethernet endpoint host is required');
  if (!Number.isInteger(endpoint.port) || endpoint.port <= 0 || endpoint.port > 65535) throw new Error(`Invalid Ethernet port: ${endpoint.port}`);
}

export class AutomotiveEthernetGateway {
  private readonly services = new Map<string, EthernetServiceDescriptor>();
  private linkState: EthernetLinkState = 'down';
  private publishedMessages = 0;
  private failedMessages = 0;

  constructor(private readonly transport: EthernetTransport) {}

  registerService(service: EthernetServiceDescriptor): void {
    if (this.services.has(service.id)) throw new Error(`Ethernet service already registered: ${service.id}`);
    validateEndpoint(service.endpoint);
    this.services.set(service.id, service);
  }

  getService(serviceId: string): EthernetServiceDescriptor {
    const service = this.services.get(serviceId);
    if (!service) throw new Error(`Ethernet service not registered: ${serviceId}`);
    return service;
  }

  async open(): Promise<void> {
    await this.transport.open();
    this.linkState = 'up';
  }

  async close(): Promise<void> {
    await this.transport.close();
    this.linkState = 'down';
  }

  async publish(serviceId: string, payload: EthernetPayload, correlationId?: string): Promise<EthernetTransportResult> {
    if (this.linkState !== 'up') throw new Error('Automotive Ethernet gateway link is not up');
    const service = this.getService(serviceId);
    const result = await this.transport.publish(service, { serviceId, payload, timestamp: now(), correlationId });
    if (result.accepted) this.publishedMessages += 1;
    else this.failedMessages += 1;
    return result;
  }

  async request(serviceId: string, payload: EthernetPayload, correlationId?: string): Promise<EthernetMessage> {
    if (this.linkState !== 'up') throw new Error('Automotive Ethernet gateway link is not up');
    const service = this.getService(serviceId);
    return this.transport.request(service, { serviceId, payload, timestamp: now(), correlationId });
  }

  health(): EthernetHealthSnapshot {
    return {
      linkState: this.linkState,
      services: [...this.services.values()],
      publishedMessages: this.publishedMessages,
      failedMessages: this.failedMessages,
      messages: [`${this.services.size} Ethernet services registered.`, `${this.publishedMessages} messages published.`],
    };
  }
}

export class SimulatorEthernetTransport implements EthernetTransport {
  private opened = false;
  private readonly messages: EthernetMessage[] = [];

  open(): void {
    this.opened = true;
  }

  close(): void {
    this.opened = false;
  }

  publish(service: EthernetServiceDescriptor, message: EthernetMessage): EthernetTransportResult {
    if (!this.opened) return { accepted: false, serviceId: service.id, reason: 'Transport is closed.', correlationId: message.correlationId };
    if (service.secure === false && service.qos === 'control') return { accepted: false, serviceId: service.id, reason: 'Control service must be secure.', correlationId: message.correlationId };
    this.messages.push(message);
    return { accepted: true, serviceId: service.id, reason: 'Simulator Ethernet transport accepted message.', correlationId: message.correlationId };
  }

  request(service: EthernetServiceDescriptor, message: EthernetMessage): EthernetMessage {
    if (!this.opened) throw new Error('Transport is closed.');
    this.messages.push(message);
    return { serviceId: service.id, payload: { ok: true, service: service.name }, timestamp: now(), correlationId: message.correlationId };
  }

  history(): EthernetMessage[] {
    return [...this.messages];
  }
}

export function createAutomotiveEthernetGateway(transport: EthernetTransport = new SimulatorEthernetTransport()): AutomotiveEthernetGateway {
  return new AutomotiveEthernetGateway(transport);
}
