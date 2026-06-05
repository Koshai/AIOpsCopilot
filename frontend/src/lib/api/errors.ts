import { isAxiosError, type AxiosError } from "axios";

type FastApiValidationError = {
  type: string;
  loc: (string | number)[];
  msg: string;
};

type FastApiErrorBody = {
  detail?: string | FastApiValidationError[];
};

export function getApiErrorMessage(error: unknown, fallback = "Request failed"): string {
  if (isAxiosError(error)) {
    return parseAxiosErrorMessage(error, fallback);
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function getApiErrorStatusCode(error: unknown): number | undefined {
  if (isAxiosError(error)) {
    return error.response?.status;
  }

  return undefined;
}

function parseAxiosErrorMessage(
  error: AxiosError,
  fallback: string
): string {
  if (error.code === "ERR_NETWORK" || !error.response) {
    return fallback;
  }

  const body = error.response.data as FastApiErrorBody | undefined;
  const detail = body?.detail;

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    return detail
      .map((item) => {
        const field = item.loc.filter((part) => part !== "body").join(".");
        return field ? `${field}: ${item.msg}` : item.msg;
      })
      .join("; ");
  }

  return error.message || fallback;
}
