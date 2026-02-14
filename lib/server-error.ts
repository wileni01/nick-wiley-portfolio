const ERROR_MESSAGE_MAX_CHARS = 1200;

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
