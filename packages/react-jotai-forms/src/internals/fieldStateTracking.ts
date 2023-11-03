import type { Atom, WritableAtom } from 'jotai';
import { atom } from 'jotai';
import type { AnyPath } from '../path';
import { produce } from 'immer';
import { isAtom } from '@principlestudios/jotai-utilities/isAtom';

export type SetStateNoInitialAction<T> = (prev: T | undefined) => T;
export type NoInitialWritableAtom<Value> = WritableAtom<
	Value,
	[Value | SetStateNoInitialAction<Value>],
	void
>;

export const defaultField = Symbol('Default field');
export type FieldStatePrimitive = string | number | symbol | bigint | boolean;
export type PerFieldState<T extends FieldStatePrimitive> =
	| {
			[field: string | number | symbol]: PerFieldState<T>;
	  }
	| T;

export type FieldStateAtom<T extends FieldStatePrimitive> =
	NoInitialWritableAtom<PerFieldState<T>>;

export function toWritableAtom<T extends FieldStatePrimitive>(
	value: PerFieldState<T> | Atom<PerFieldState<T>>
): FieldStateAtom<T> {
	const fieldState = atom(value);
	if (!isAtom(value)) return toAtomFieldState(value);
	return atom(
		(get) => {
			const temp = get(fieldState);
			return isAtom(temp) ? get(temp) : temp;
		},
		(get, set, action) => {
			let temp = get(fieldState);
			temp = isAtom(temp) ? get(temp) : temp;
			set(
				fieldState,
				typeof action === 'function' ? action(temp) : () => action
			);
		}
	);
}

export function walkFieldState<T extends FieldStatePrimitive>(
	fieldState: PerFieldState<T>,
	path: AnyPath
): PerFieldState<T> {
	if (
		typeof fieldState === 'object' &&
		fieldState !== null &&
		path.length > 0
	) {
		return walkFieldState(
			fieldState[path[0]] ?? fieldState[defaultField],
			path.slice(1)
		);
	}
	return fieldState;
}

function ensureValue<T extends FieldStatePrimitive>(
	fieldState: PerFieldState<T>
): T {
	if (typeof fieldState === 'object' && defaultField in fieldState)
		return ensureValue(fieldState[defaultField]);
	return fieldState as T;
}

export function toAtomFieldState<T extends FieldStatePrimitive>(
	initial: PerFieldState<T>
): FieldStateAtom<T> {
	const rawAtom: FieldStateAtom<T> = atom(initial);
	return rawAtom;
}

function updateFieldState<T extends FieldStatePrimitive>(
	fieldState: undefined | PerFieldState<T>,
	path: AnyPath,
	alteration: SetStateNoInitialAction<PerFieldState<T>>
): PerFieldState<T> {
	if (path.length === 0) return alteration(fieldState as PerFieldState<T>);
	if (typeof fieldState === 'object') {
		return produce(fieldState, (draft: PerFieldState<T> & object) => {
			draft[path[0]] =
				path[0] in draft
					? updateFieldState(draft[path[0]], path.slice(1), alteration)
					: defaultField in draft
					? updateFieldState(draft[defaultField], path.slice(1), alteration)
					: updateFieldState(undefined, path.slice(1), alteration);
		});
	}
	const result: PerFieldState<T> & object = {};
	if (typeof fieldState !== 'undefined') {
		result[defaultField] = fieldState;
	}
	result[path[0]] = updateFieldState(fieldState, path.slice(1), alteration);
	return result;
}

export function walkFieldStateAtom<T extends FieldStatePrimitive>(
	fieldState: FieldStateAtom<T>,
	path: AnyPath
): FieldStateAtom<T> {
	return atom(
		(get) => walkFieldState(get(fieldState), path),
		(get, set, action) => {
			set(
				fieldState,
				produce<PerFieldState<T>>((prev) => {
					return updateFieldState(
						prev as PerFieldState<T>,
						path,
						typeof action === 'function' ? action : () => action
					);
				})
			);
		}
	);
}

export function toFieldStateValue<T extends FieldStatePrimitive>(
	fieldState: FieldStateAtom<T>
): NoInitialWritableAtom<T> {
	return atom(
		(get) => ensureValue(get(fieldState)),
		(get, set, action) => {
			set(
				fieldState,
				produce<PerFieldState<T>>((prev) => {
					return (typeof action === 'function' ? action : () => action)(
						prev as T
					);
				})
			);
		}
	);
}
