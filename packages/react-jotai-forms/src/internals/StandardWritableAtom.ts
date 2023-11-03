import type { WritableAtom } from 'jotai';

export type SetStateAction<T> = (prev: T) => T;
export type StandardWritableAtom<Value> = WritableAtom<
	Value,
	[Value | SetStateAction<Value>],
	void
>;
