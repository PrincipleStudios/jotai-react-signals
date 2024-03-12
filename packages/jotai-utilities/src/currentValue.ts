import { getDefaultStore } from 'jotai';
import type { Atom, Getter } from 'jotai';
import { isAtom } from './isAtom';

/**
 * Gets the current value of the target
 * @param target A Jotai atom or a non-atom value
 * @param get (Optional) The get function to use. If not provided, the Jotai
 * default store is used.
 * @returns If the target provided is an atom, the value stored in the atom.
 * Otherwise, the provided value.
 */
export function currentValue<T>(target: Atom<T> | T, get?: Getter) {
	if (isAtom(target)) return (get ?? getDefaultStore().get)(target);
	return target;
}
