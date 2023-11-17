import type { LoadableError } from './error';
import type { Idle } from './idle';
import type { Loaded } from './loaded';
import type { Loading } from './loading';

export type Loadable<T> = Loading<T> | LoadableError | Loaded<T> | Idle;
