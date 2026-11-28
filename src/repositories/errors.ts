import { RepositoryError } from '@arsdehnel/rwsdk-atp/errors';

/**
 * Thrown when an unexpected error occurs during a D1/database operation —
 * e.g. a constraint violation or connection failure.
 *
 * This class mirrors the one in rwsdk-atp and will be removed once that
 * package is rebuilt and reinstalled with the new export.
 */
export class DatabaseOperationError extends RepositoryError {
	public readonly code = 500;

	constructor(description: string, cause?: unknown) {
		super(`Database operation failed: ${description}`);
		this.name = 'DatabaseOperationError';
		if (cause instanceof Error) {
			this.cause = cause;
		}
	}
}

/**
 * Thrown when an unexpected error occurs during an ATP/PDS operation.
 * Extracts XRPC error metadata (status, error code, retryability) via duck-typing
 * so callers can distinguish auth failures, rate limits, and transient errors
 * without hard-depending on @atproto/lex-rpc internals.
 *
 * This class mirrors the one in rwsdk-atp and will be removed once that
 * package is rebuilt and reinstalled with the new export.
 */
export class AtpOperationError extends RepositoryError {
	public readonly code = 500;
	public readonly atpStatus?: number;
	public readonly atpError?: string;
	public readonly retryable: boolean;

	constructor(description: string, cause?: unknown) {
		super(`ATP operation failed: ${description}`);
		this.name = 'AtpOperationError';
		if (cause instanceof Error) {
			this.cause = cause;
		}
		if (cause != null && typeof cause === 'object') {
			const c = cause as Record<string, unknown>;
			// Only capture real HTTP status codes; XrpcFetchError uses ResponseType.Unknown = 1
			if (typeof c.status === 'number' && c.status >= 100) {
				this.atpStatus = c.status;
			}
			if (typeof c.error === 'string') {
				this.atpError = c.error;
			}
			this.retryable = typeof c.shouldRetry === 'function' ? Boolean((c.shouldRetry as () => unknown)()) : false;
		} else {
			this.retryable = false;
		}
	}
}
