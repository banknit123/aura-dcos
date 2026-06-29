export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  data?: unknown;
}

export interface LoggerOptions {
  source: string;
  minimumLevel?: LogLevel;
}

const levelWeight: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export class AuraLogger {
  private readonly source: string;
  private readonly minimumLevel: LogLevel;
  private readonly history: LogEntry[] = [];

  constructor(options: LoggerOptions) {
    this.source = options.source;
    this.minimumLevel = options.minimumLevel ?? 'info';
  }

  debug(message: string, data?: unknown): void {
    this.write('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.write('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.write('warn', message, data);
  }

  error(message: string, data?: unknown): void {
    this.write('error', message, data);
  }

  getHistory(): readonly LogEntry[] {
    return this.history;
  }

  private write(level: LogLevel, message: string, data?: unknown): void {
    if (levelWeight[level] < levelWeight[this.minimumLevel]) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      source: this.source,
      message,
      data,
    };

    this.history.push(entry);

    const payload = data === undefined ? '' : ` ${JSON.stringify(data)}`;
    const line = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.source}] ${entry.message}${payload}`;

    if (level === 'error') console.error(line);
    else if (level === 'warn') console.warn(line);
    else console.log(line);
  }
}

export function createLogger(source: string, minimumLevel?: LogLevel): AuraLogger {
  return new AuraLogger({ source, minimumLevel });
}
