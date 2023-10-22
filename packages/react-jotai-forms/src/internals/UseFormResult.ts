import type { Atom } from 'jotai';
import type { useStore } from 'jotai';
import type React from 'react';
import type { ZodError, ZodType } from 'zod';
import type { StandardWritableAtom } from './StandardWritableAtom';
import type { AnyPath, Path, PathValue } from '../path';
import type { Loadable } from 'jotai/vanilla/utils/loadable';
import type { RegisterErrorStrategy } from './errorsStrategy';
import type { FormEvents } from '../events/FormEvents';
import type { FieldStateAtom } from './fieldStateTracking';
import type { FormFieldReturnType } from './FormFieldReturnType';
import type { AtomFamily, DefaultFormFieldResultFlags } from './useFormHelpers';

export interface UseFormResult<T> {
	pathPrefix: AnyPath;
	translationPath: AnyPath;
	store: ReturnType<typeof useStore>;
	atom: StandardWritableAtom<T>;
	atomFamily: AtomFamily<T>;
	schema: ZodType<T>;
	errors: Atom<Loadable<ZodError<T> | null>>;
	formEvents: FormEvents;
	defaultValue: React.MutableRefObject<T>;
	disabledFields: FieldStateAtom<boolean>;
	readOnlyFields: FieldStateAtom<boolean>;
	formTranslation: (field: string) => string;
	field<TPath extends Path<T>>(
		path: TPath,
	): FormFieldReturnType<PathValue<T, TPath>, DefaultFormFieldResultFlags>;
	updateAllErrors(this: void): void;

	get(this: void): T;
	set(this: void, value: T | ((prevValue: T) => T)): void;
	handleSubmit(
		this: void,
		callback: (value: T) => void | Promise<void>,
	): (ev?: React.SyntheticEvent<unknown>) => void;
	errorStrategy: RegisterErrorStrategy;
}
