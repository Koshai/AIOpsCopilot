import { getApiBaseUrl } from "@/lib/api/client";

export function getWebSocketUrl(path = "/ws"): string {
  const baseUrl = getApiBaseUrl();
  const url = new URL(baseUrl);

  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = path.startsWith("/") ? path : `/${path}`;

  return url.toString();
}
