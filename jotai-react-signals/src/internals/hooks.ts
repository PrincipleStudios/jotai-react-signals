import { useRef } from 'react';
import { type Atom, type PrimitiveAtom, atom, useSetAtom, Getter } from 'jotai';
import { isSignal } from './utils';

export function useComputedSignal<T>(compute: (get: Getter) => T): Atom<T> {
	const result = useRef<{
		prevInput: typeof compute;
		base: PrimitiveAtom<{ compute: typeof compute }>;
		output: Atom<T>;
	}>();
	if (result.current === undefined) {
		const base = atom({ compute });
		result.current = {
			prevInput: compute,
			base,
			output: atom((get) => get(base).compute(get)),
		};
	}
	const target = result.current;
	const setBase = useSetAtom(target.base);
	if (target.prevInput !== compute) {
		target.prevInput = compute;
		setBase({ compute });
	}
	return result.current.output;
}

/** Creates a signal from a property that may change based on a React rerender */
export function useAsAtom<T>(valueOrSignal: T | Atom<T>): Atom<T> {
	const result = useRef<{
		prevInput: typeof valueOrSignal;
		base: PrimitiveAtom<T | Atom<T>>;
		output: Atom<T>;
	}>();
	if (result.current === undefined) {
		const base = atom(valueOrSignal);
		result.current = {
			prevInput: valueOrSignal,
			base,
			output: atom((get) => {
				const maybeResult = get(base);
				if (isSignal(maybeResult)) return get(maybeResult);
				return maybeResult;
			}),
		};
	}
	const target = result.current;
	const setBase = useSetAtom(target.base);
	if (target.prevInput !== valueOrSignal) {
		target.prevInput = valueOrSignal;
		setBase(valueOrSignal);
	}
	return result.current.output;
}
