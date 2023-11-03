import type { Atom } from 'jotai';
import type { ZodError } from 'zod';
import type { Loadable } from 'jotai/vanilla/utils/loadable';

export type ErrorsAtom = Atom<Loadable<ZodError | null>>;
