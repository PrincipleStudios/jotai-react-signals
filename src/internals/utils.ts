import { type Atom } from 'jotai';

export function isSignal(target: unknown): target is Atom<unknown> {
	return (target || false) && Object.hasOwn(target, 'read');
}
