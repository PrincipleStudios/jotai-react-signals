export const loadingType = 'loading';
export type Loading<T> = { type: typeof loadingType; value?: T };

export const loading = Object.freeze({ type: loadingType } as const);
export function makeLoading(): typeof loading;
export function makeLoading<T>(previousValue?: T): Loading<T>;
export function makeLoading<T>(previousValue?: T): Loading<T> {
	return { type: loadingType, value: previousValue };
}
