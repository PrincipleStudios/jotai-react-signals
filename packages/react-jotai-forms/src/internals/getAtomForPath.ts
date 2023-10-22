import { atom } from 'jotai';
import type {
	SetStateAction,
	StandardWritableAtom,
} from './StandardWritableAtom';
import type { AnyPath, Path, PathValue } from '../path';
import type { Patch, Objectish } from 'immer';
import { applyPatches, produceWithPatches } from 'immer';

export function getValueAtPath<T, TPath extends Path<T>>(
	steps: TPath,
): (input: T) => PathValue<T, TPath> {
	return (input: T): PathValue<T, TPath> => {
		try {
			return (steps as ReadonlyArray<string | number>).reduce(
				(prev, next) => (prev as never)[next],
				input as unknown,
			) as PathValue<T, TPath>;
		} catch (ex) {
			console.warn({ input, steps });
			throw ex;
		}
	};
}

export function getAtomForPath<T, TPath extends Path<T>>(
	steps: TPath,
	source: StandardWritableAtom<T>,
) {
	type TOut = PathValue<T, TPath>;

	const getPathValue = getValueAtPath<T, TPath>(steps);
	const resultAtom = atom(
		(get): PathValue<T, TPath> => getPathValue(get(source)),
		(_get, set, effect: TOut | SetStateAction<TOut>) =>
			set(source, (prev) => {
				// 'val' is added and removed here to handle `undefined` returns.
				// If `undefined` is returned, immer assumes the Draft (`d`) is
				// modified, losing track of the `undefined`. This necessitates
				// the `.slice(1)` below.
				const patches: Patch[] =
					typeof effect === 'function'
						? produceWithPatches<{ val: PathValue<T, TPath> }>(
								{ val: getPathValue(prev) },
								(d) => {
									d.val = (effect as SetStateAction<TOut>)(
										d.val as TOut,
									) as never;
								},
						  )[1]
						: [{ op: 'replace', path: [], value: effect }];
				const finalPatches = patches.map(
					(patch): Patch => ({
						...patch,
						path: [...(steps as AnyPath), ...patch.path.slice(1)],
					}),
				);
				return applyPatches(prev as Objectish, finalPatches) as T;
			}),
	);
	resultAtom.debugLabel = (steps as AnyPath).join('/') + `#${Math.random()}`;
	return resultAtom;
}
