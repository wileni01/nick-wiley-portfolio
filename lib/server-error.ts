const ERROR_MESSAGE_MAX_CHARS = 1200;
const LOG_MESSAGE_MAX_CHARS = 240;

export interface SerializedServerError {
  name: string;
  message: string;
}

export function serializeServerError(error: unknown): SerializedServerError {
  if (error instanceof Error) {
    return {
      name: error.name || "Error",
      message: error.message.slice(0, ERROR_MESSAGE_MAX_CHARS),
    };
  }

  return {
    name: "UnknownError",
    message: String(error).slice(0, ERROR_MESSAGE_MAX_CHARS),
  };
}

interface ServerLogBaseInput {
  route: string;
  requestId: string;
  details?: Record<string, unknown>;
}

interface ServerErrorLogInput extends ServerLogBaseInput {
  error: unknown;
}

interface ServerWarningLogInput extends ServerLogBaseInput {
  message: string;
}

export function logServerError(input: ServerErrorLogInput) {
  console.error(`${input.route} error`, {
    requestId: input.requestId,
    error: serializeServerError(input.error),
    ...(input.details ? { details: input.details } : {}),
  });
}

export function logServerWarning(input: ServerWarningLogInput) {
  console.warn(`${input.route} warning`, {
    requestId: input.requestId,
    message: input.message.slice(0, LOG_MESSAGE_MAX_CHARS),
    ...(input.details ? { details: input.details } : {}),
  });
}
