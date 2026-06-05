export function formatFieldName(name: string): string {
  return name
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatScalar(value: unknown): string {
  if (value == null) {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string") {
    return value.trim() || "—";
  }

  return String(value);
}

export function formatFieldValue(value: unknown): string {
  if (value == null) {
    return "—";
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "—";
    }

    if (value.every((item) => item == null || typeof item !== "object")) {
      return value.map((item) => formatScalar(item)).join(", ");
    }

    return JSON.stringify(value, null, 2);
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return formatScalar(value);
}

export function getExtractionFieldEntries(
  fields: Record<string, unknown>
): Array<[string, unknown]> {
  return Object.entries(fields).sort(([left], [right]) =>
    left.localeCompare(right)
  );
}
