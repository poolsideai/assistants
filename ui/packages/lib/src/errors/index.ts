export class CodedError extends Error {
  readonly code: number;
  readonly data?: unknown;

  constructor(
    message: string,
    { code, data, name = "CodedError" }: { code: number; data?: unknown; name?: string },
  ) {
    super(message);
    this.name = name;
    this.code = code;
    this.data = data;
  }
}

type FormatErrorOptions = {
  prefix?: string;
  truncateLength?: number;
};

export function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  // RPC and worker boundaries often serialize errors into plain objects that
  // still carry a numeric code, message, and optional data payload.
  if (isCodedErrorLike(error)) {
    return new CodedError(error.message, {
      code: error.code,
      data: error.data,
      name: error.name,
    });
  }

  // Some flows preserve only the basic Error fields after postMessage or JSON
  // serialization. Rehydrate those into a usable Error instance.
  if (isMessageErrorLike(error)) {
    const normalizedError = new Error(error.message);

    if (typeof error.name === "string") {
      normalizedError.name = error.name;
    }

    return normalizedError;
  }

  // Primitive throws and unknown objects are uncommon but still happen in
  // application code. Normalize them so object-shaped failures do not surface
  // as "[object Object]".
  return new Error(getUnknownErrorMessage(error));
}

export function getErrorMessage(error: Error, seen: WeakSet<object> = new WeakSet()): string {
  const requestErrorMessage = getRequestErrorMessage(error);
  if (requestErrorMessage) {
    return requestErrorMessage;
  }

  if (isUsefulMessage(error.message)) {
    return error.message.trim();
  }

  // Only dig into data/cause when they hold an actual value: CodedError always
  // defines `data` (even as undefined), and digging into undefined/null would
  // surface the literal string "undefined"/"null" as a "useful" message. Thread
  // the shared `seen` set so cyclic Error.cause/.data chains terminate.
  const data = (error as Error & { data?: unknown }).data;
  if (data != null) {
    const dataMessage = getUnknownErrorMessageInner(data, seen);
    if (isUsefulMessage(dataMessage)) {
      return dataMessage;
    }
  }

  const cause = (error as Error & { cause?: unknown }).cause;
  if (cause != null) {
    const causeMessage = getUnknownErrorMessageInner(cause, seen);
    if (isUsefulMessage(causeMessage)) {
      return causeMessage;
    }
  }

  return "Unknown error";
}

export function formatError(
  error: unknown,
  { prefix, truncateLength = 256 }: FormatErrorOptions = {},
): string {
  const message = truncate(getErrorMessage(toError(error)), truncateLength);

  if (!prefix) {
    return message;
  }
  // ensure we have some space left
  const p = prefix + ": ";
  if (p.length >= truncateLength) {
    return truncate(prefix, truncateLength);
  }

  return `${p}${truncate(message, truncateLength - prefix.length)}`;
}

type MessageErrorLike = {
  message: string;
  name?: string;
};

type CodedErrorLike = MessageErrorLike & {
  code: number;
  data?: unknown;
};

function isMessageErrorLike(error: unknown): error is MessageErrorLike {
  return (
    typeof error === "object" &&
    error != null &&
    "message" in error &&
    typeof error.message === "string"
  );
}

function isCodedErrorLike(error: unknown): error is CodedErrorLike {
  return isMessageErrorLike(error) && "code" in error && typeof error.code === "number";
}

export function getUnknownErrorMessage(error: unknown): string {
  return getUnknownErrorMessageInner(error, new WeakSet());
}

function getUnknownErrorMessageInner(error: unknown, seen: WeakSet<object>): string {
  if (error instanceof Error) {
    if (seen.has(error)) {
      return "Unknown error";
    }
    seen.add(error);
    return getErrorMessage(error, seen);
  }

  if (typeof error === "string") {
    return error.trim() || "Unknown error";
  }

  if (
    typeof error === "number" ||
    typeof error === "boolean" ||
    typeof error === "bigint" ||
    typeof error === "symbol" ||
    error == null
  ) {
    return String(error);
  }

  if (typeof error !== "object") {
    return "Unknown error";
  }

  if (seen.has(error)) {
    return "Unknown error";
  }
  seen.add(error);

  if (Array.isArray(error)) {
    const messages = error
      .map((item) => getUnknownErrorMessageInner(item, seen))
      .filter(isUsefulMessage);
    if (messages.length > 0) {
      return messages.join(", ");
    }
  }

  const record = error as Record<string, unknown>;
  const stringFields = ["message", "detail", "error_description", "reason"];
  for (const field of stringFields) {
    const value = record[field];
    if (typeof value === "string" && isUsefulMessage(value)) {
      return value.trim();
    }
  }

  const nestedFields = ["error", "data", "cause", "details", "body"];
  for (const field of nestedFields) {
    if (!(field in record)) continue;
    const message = getUnknownErrorMessageInner(record[field], seen);
    if (isUsefulMessage(message)) {
      return message;
    }
  }

  return stringifyErrorObject(error) ?? "Unknown error";
}

function isUsefulMessage(message: string | null | undefined): message is string {
  if (typeof message !== "string") return false;
  const normalized = message.trim();
  return (
    normalized.length > 0 && normalized !== "[object Object]" && normalized !== "[object object]"
  );
}

function stringifyErrorObject(error: object): string | null {
  const seen = new WeakSet<object>();
  try {
    const message = JSON.stringify(error, (_key, value: unknown) => {
      if (typeof value !== "object" || value == null) {
        return value;
      }
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
      if (value instanceof Error) {
        return {
          name: value.name,
          message: value.message,
          stack: value.stack,
        };
      }
      return value;
    });
    return isUsefulMessage(message) ? message : null;
  } catch {
    return null;
  }
}

function getRequestErrorMessage(error: Error): string | null {
  if (!("body" in error) || typeof error.body !== "object" || error.body == null) {
    return null;
  }

  const { body } = error as Error & { body: { errors?: unknown; detail?: unknown } };

  if (Array.isArray(body.errors)) {
    const firstError = body.errors[0];
    if (
      typeof firstError === "object" &&
      firstError != null &&
      "message" in firstError &&
      typeof firstError.message === "string" &&
      firstError.message.trim().length > 0
    ) {
      return firstError.message;
    }
  }

  if (typeof body.detail === "string" && body.detail.trim().length > 0) {
    return body.detail;
  }

  return null;
}

function truncate(message: string, truncateLength: number): string {
  if (truncateLength <= 0 || message.length <= truncateLength) {
    return message;
  }

  return `${message.slice(0, truncateLength - 1).trimEnd()}…`;
}
