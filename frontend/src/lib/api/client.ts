import axios, { type AxiosError, type AxiosInstance } from "axios";

const DEFAULT_BASE_URL = "http://localhost:8000";

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_BASE_URL;
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    Accept: "application/json",
  },
  timeout: 120_000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.code === "ERR_NETWORK" || !error.response) {
      return Promise.reject(
        new Error(
          `Cannot reach API at ${getApiBaseUrl()}. Ensure the backend is running and CORS is enabled.`
        )
      );
    }

    const message =
      (error.response?.data as { detail?: string } | undefined)?.detail ??
      error.message ??
      "Request failed";
    return Promise.reject(new Error(message));
  }
);

export function unwrap<T>(promise: Promise<{ data: T }>): Promise<T> {
  return promise.then((response) => response.data);
}
