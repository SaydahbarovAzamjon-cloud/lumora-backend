/**
 * Typed AI upstream failures. Mapped to safe GraphQL/HTTP errors by Nest (T-107).
 */
export class AiUpstreamError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'AiUpstreamError';
  }
}

export class AiUnavailableError extends AiUpstreamError {
  constructor(message = 'AI service unavailable') {
    super(message, 'AI_UNAVAILABLE');
    this.name = 'AiUnavailableError';
  }
}

export class AiInvalidResponseError extends AiUpstreamError {
  constructor(message = 'AI returned an invalid response') {
    super(message, 'AI_INVALID_RESPONSE');
    this.name = 'AiInvalidResponseError';
  }
}
