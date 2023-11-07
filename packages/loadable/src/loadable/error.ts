export const errorType = 'error';
export type LoadableError = { type: typeof errorType; error?: unknown };
export function makeError(error?: unknown): LoadableError {
	return { type: errorType, error };
}
