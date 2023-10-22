/* eslint-disable @typescript-eslint/no-explicit-any */

export type AnyArray = any[];

export function isArray(array: any): array is readonly any[] {
	return Array.isArray(array);
}
