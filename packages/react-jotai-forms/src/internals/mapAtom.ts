import { atom } from 'jotai';
import type {
	SetStateAction,
	StandardWritableAtom,
} from './StandardWritableAtom';

export const noChange = Symbol('field-mapping-no-change');

export function mapAtom<TIn, TOut>(
	target: StandardWritableAtom<TIn>,
	toOut: (v: TIn) => TOut,
	fromOut: (v: TOut) => TIn | typeof noChange,
): StandardWritableAtom<TOut> {
	return atom(
		(get) => toOut(get(target)),
		(_get, set, effect: TOut | SetStateAction<TOut>) =>
			set(target, (prev) => {
				const result = fromOut(
					typeof effect === 'function'
						? (effect as SetStateAction<TOut>)(toOut(prev))
						: effect,
				);
				return result === noChange ? prev : result;
			}),
	);
}
