import type { Atom, Getter } from 'jotai';
import { isAtom } from './isAtom';

export function getAtomOrValue<T>(get: Getter, target: Atom<T> | T) {
	if (isAtom(target)) return get(target);
	return target;
}
