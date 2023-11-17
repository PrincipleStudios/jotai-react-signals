import { neverEver } from './internal/never-ever';
import { isError, isIdle, isLoaded, isLoading, Loadable } from './loadable';

export function mapLoadable<TInput, TResult>(
	thing: Loadable<TInput>,
	{
		idle: whenIdle,
		loading: whenLoading,
		loaded: whenLoaded,
		error: whenError,
	}: {
		idle?: () => TResult;
		loading: (value?: TInput) => TResult;
		loaded: (value: TInput) => TResult;
		error: (error?: unknown) => TResult;
	}
): TResult {
	if (isLoading(thing)) return whenLoading(thing.value);
	if (isIdle(thing)) return (whenIdle || whenLoading)();
	if (isError(thing)) return whenError(thing.error);
	if (isLoaded(thing)) return whenLoaded(thing.value);
	return neverEver(thing);
}
