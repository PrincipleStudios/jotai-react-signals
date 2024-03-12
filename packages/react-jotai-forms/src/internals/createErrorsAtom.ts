import type { Atom, WritableAtom } from 'jotai';
import { atom } from 'jotai';
import { loadable } from 'jotai/utils';
import type { Loadable } from 'jotai/vanilla/utils/loadable';
import { ZodError, ZodType } from 'zod';
import { AnyPath } from '../path';

type MaybeErrors = ZodError | null;

function createErrorParser<T>(schema: ZodType<T>, pathPrefix: AnyPath) {
	return async (value: T) => {
		const parseResult = await schema.safeParseAsync(value);
		if (parseResult.success) return null;
		const errors = parseResult.error;
		if (pathPrefix.length === 0) return errors;
		return new ZodError(
			errors.errors.map((issue) => ({
				...issue,
				path: [...pathPrefix, ...issue.path],
			}))
		);
	};
}

export function createErrorsAtom<T>(
	target: Atom<T>,
	schema: ZodType<T>,
	pathPrefix: AnyPath = []
): Atom<Loadable<MaybeErrors>> {
	const errorParser = createErrorParser(schema, pathPrefix);
	return loadable(atom((get) => errorParser(get(target))));
}

export function createTriggeredErrorsAtom<T>(
	target: Atom<T>,
	schema: ZodType<T>,
	pathPrefix: AnyPath = []
): [Atom<Loadable<MaybeErrors>>, WritableAtom<void, [], void>] {
	const errors = atom<Promise<MaybeErrors>>(Promise.resolve(null));

	const errorParser = createErrorParser(schema, pathPrefix);
	const writable = atom<void, [], void>(void 0, (get, set) => {
		set(errors, errorParser(get(target)));
	});

	return [loadable(errors), writable];
}
