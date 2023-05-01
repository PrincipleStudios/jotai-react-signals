import { type Atom } from 'jotai';

export function isAtom(target: unknown): target is Atom<unknown> {
	return (
		(target || false) && Object.prototype.hasOwnProperty.call(target, 'read')
	);
}
