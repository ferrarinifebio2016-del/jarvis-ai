/** Only curated messages cross the API boundary. Upstream bodies and credentials are never echoed. */
export class AIError extends Error {
  constructor(public readonly code: string, message: string, public readonly status = 502) {
    super(message);
    this.name = 'AIError';
  }
}
