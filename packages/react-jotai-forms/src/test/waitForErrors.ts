import { Atom, getDefaultStore } from 'jotai';
import { Loadable } from 'jotai/vanilla/utils/loadable';
import { ZodError } from 'zod';
import { fastWaitFor } from './fastWaitFor';

export async function waitForErrors<T>(
	errorsAtom: Atom<Loadable<ZodError<T> | null>>,
	store?: ReturnType<typeof getDefaultStore>
) {
	store ??= getDefaultStore();
	return await fastWaitFor(() => {
		const errors = store!.get(errorsAtom);
		expect(errors.state).toBe('hasData');
		const loadedErrors = (errors as typeof errors & { state: 'hasData' }).data;
		// expect(loadedErrors).not.toBe(null);
		return loadedErrors;
	});
}
