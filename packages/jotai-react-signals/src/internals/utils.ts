import { type Atom } from 'jotai';

export function isSignal(target: unknown): target is Atom<unknown> {
	return (
		(target || false) && Object.prototype.hasOwnProperty.call(target, 'read')
	);
}
