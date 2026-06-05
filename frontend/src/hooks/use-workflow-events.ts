"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getWebSocketUrl } from "@/lib/api/websocket";
import {
  createWorkflowEventWebSocketService,
  type WorkflowConnectionStatus,
  type WorkflowEventWebSocketService,
} from "@/services/workflow-event-websocket-service";
import type { WorkflowEvent } from "@/types/workflow-timeline";

export type { WorkflowConnectionStatus } from "@/services/workflow-event-websocket-service";

export type UseWorkflowEventsOptions = {
  enabled?: boolean;
  url?: string;
  maxEvents?: number;
  autoReconnect?: boolean;
};

export function useWorkflowEvents(options: UseWorkflowEventsOptions = {}) {
  const {
    enabled = true,
    url,
    maxEvents = 200,
    autoReconnect = true,
  } = options;

  const [events, setEvents] = useState<WorkflowEvent[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<WorkflowConnectionStatus>("idle");

  const serviceRef = useRef<WorkflowEventWebSocketService | null>(null);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  const appendEvent = useCallback(
    (event: WorkflowEvent) => {
      setEvents((current) => {
        const next = [...current, event];
        if (next.length <= maxEvents) {
          return next;
        }
        return next.slice(next.length - maxEvents);
      });
    },
    [maxEvents]
  );

  useEffect(() => {
    if (!enabled) {
      serviceRef.current?.disconnect();
      serviceRef.current = null;
      setConnectionStatus("idle");
      return;
    }

    const service = createWorkflowEventWebSocketService({
      url: url ?? getWebSocketUrl("/ws"),
      autoReconnect,
    });

    serviceRef.current = service;

    const unsubscribeEvent = service.onEvent(appendEvent);
    const unsubscribeStatus = service.onStatusChange(setConnectionStatus);

    service.connect();

    return () => {
      unsubscribeEvent();
      unsubscribeStatus();
      service.disconnect();
      serviceRef.current = null;
      setConnectionStatus("idle");
    };
  }, [appendEvent, autoReconnect, enabled, url]);

  return {
    events,
    connectionStatus,
    clearEvents,
  };
}
