export const loadedType = 'loaded';
export type Loaded<T> = { type: typeof loadedType; value: T };

export function makeLoaded<T>(value: T): Loaded<T> {
	return { type: loadedType, value };
}
