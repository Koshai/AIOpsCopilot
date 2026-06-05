import { getWebSocketUrl } from "@/lib/api/websocket";
import { parseWorkflowEventMessage } from "@/lib/workflow-events";
import type { WorkflowEvent } from "@/types/workflow-timeline";

const INITIAL_RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 30_000;
const DEFAULT_WS_PATH = "/ws";

export type WorkflowConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting"
  | "error";

export type WorkflowEventWebSocketOptions = {
  url?: string;
  autoReconnect?: boolean;
};

type EventListener = (event: WorkflowEvent) => void;
type StatusListener = (status: WorkflowConnectionStatus) => void;

export class WorkflowEventWebSocketService {
  private readonly url: string;
  private readonly autoReconnect: boolean;

  private socket: WebSocket | null = null;
  private status: WorkflowConnectionStatus = "idle";
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = false;

  private readonly eventListeners = new Set<EventListener>();
  private readonly statusListeners = new Set<StatusListener>();

  constructor(options: WorkflowEventWebSocketOptions = {}) {
    this.url = options.url ?? getWebSocketUrl(DEFAULT_WS_PATH);
    this.autoReconnect = options.autoReconnect ?? true;
  }

  getConnectionStatus(): WorkflowConnectionStatus {
    return this.status;
  }

  connect(): void {
    this.shouldReconnect = this.autoReconnect;
    this.openConnection();
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.clearReconnectTimer();
    this.closeSocket();
    this.setStatus("idle");
  }

  onEvent(listener: EventListener): () => void {
    this.eventListeners.add(listener);
    return () => {
      this.eventListeners.delete(listener);
    };
  }

  onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private setStatus(status: WorkflowConnectionStatus): void {
    if (this.status === status) {
      return;
    }

    this.status = status;
    for (const listener of this.statusListeners) {
      listener(status);
    }
  }

  private emitEvent(event: WorkflowEvent): void {
    for (const listener of this.eventListeners) {
      listener(event);
    }
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private closeSocket(): void {
    if (!this.socket) {
      return;
    }

    this.socket.onopen = null;
    this.socket.onmessage = null;
    this.socket.onerror = null;
    this.socket.onclose = null;
    this.socket.close();
    this.socket = null;
  }

  private scheduleReconnect(): void {
    if (!this.shouldReconnect || !this.autoReconnect) {
      this.setStatus("disconnected");
      return;
    }

    this.setStatus("disconnected");

    const delay = Math.min(
      INITIAL_RECONNECT_DELAY_MS * 2 ** this.reconnectAttempt,
      MAX_RECONNECT_DELAY_MS
    );

    this.reconnectAttempt += 1;
    this.setStatus("reconnecting");

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.openConnection();
    }, delay);
  }

  private openConnection(): void {
    if (!this.shouldReconnect) {
      return;
    }

    this.clearReconnectTimer();
    this.closeSocket();

    this.setStatus(
      this.reconnectAttempt > 0 ? "reconnecting" : "connecting"
    );

    const socket = new WebSocket(this.url);
    this.socket = socket;

    socket.onopen = () => {
      if (!this.shouldReconnect) {
        socket.close();
        return;
      }

      this.reconnectAttempt = 0;
      this.setStatus("connected");
    };

    socket.onmessage = (message) => {
      const event = parseWorkflowEventMessage(String(message.data));
      if (event) {
        this.emitEvent(event);
      }
    };

    socket.onerror = () => {
      if (this.shouldReconnect) {
        this.setStatus("error");
      }
    };

    socket.onclose = () => {
      if (this.socket === socket) {
        this.socket = null;
      }

      if (!this.shouldReconnect) {
        this.setStatus("idle");
        return;
      }

      this.scheduleReconnect();
    };
  }
}

export function createWorkflowEventWebSocketService(
  options?: WorkflowEventWebSocketOptions
): WorkflowEventWebSocketService {
  return new WorkflowEventWebSocketService(options);
}
