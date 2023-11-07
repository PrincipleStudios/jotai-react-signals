import { errorType, LoadableError } from './error';
import { idle, Idle } from './idle';
import { Loaded, loadedType } from './loaded';
import { Loading, loadingType } from './loading';
import { Loadable } from './loadable';

export function isLoaded<T>(thing: Loadable<T>): thing is Loaded<T> {
	return thing.type === loadedType;
}

export function isIdle(thing: Loadable<unknown>): thing is Idle {
	return thing === idle;
}

export function isLoading<T>(thing: Loadable<T>): thing is Loading<T> {
	return thing.type === loadingType;
}

export function isError(thing: Loadable<unknown>): thing is LoadableError {
	return thing.type === errorType;
}
