import { atom, useStore } from 'jotai';
import { errorsStrategy } from './internals/errorsStrategy';
import { FormEvents } from './events/FormEvents';
import type { FieldsConfig } from './internals/field-config-types';
import { toAtomFieldState } from './internals/fieldStateTracking';
import { useConstant } from './internals/useConstant';
import type {
	FormOptions,
	FormFieldsOptions,
	UseFormResultWithFields,
} from './internals/useFormHelpers';
import type { UseFormResult } from './internals/UseFormResult';
import {
	createPathAtomFamily,
	buildFormResult,
	buildFormFields,
} from './internals/useFormHelpers';
import { StandardWritableAtom } from './internals/StandardWritableAtom';

export function useForm<T>(
	options: FormOptions<T> & { defaultValue: T }
): UseFormResult<T>;
export function useForm<T, const TFields extends FieldsConfig<T>>(
	options: FormOptions<T> & { defaultValue: T } & FormFieldsOptions<T, TFields>
): UseFormResultWithFields<T, TFields>;
export function useForm<T>({
	defaultValue,
	...options
}: FormOptions<T> & { defaultValue: T } & Partial<
		FormFieldsOptions<T, FieldsConfig<T>>
	>): UseFormResult<T> | UseFormResultWithFields<T, FieldsConfig<T>> {
	const formAtom = useConstant(() => atom(defaultValue));
	return useFormAtom(formAtom, options);
}

export function useFormAtom<T>(
	formAtom: StandardWritableAtom<T> & { init: T },
	options: FormOptions<T>
): UseFormResult<T>;
export function useFormAtom<T, const TFields extends FieldsConfig<T>>(
	formAtom: StandardWritableAtom<T> & { init: T },
	options: FormOptions<T> & FormFieldsOptions<T, TFields>
): UseFormResultWithFields<T, TFields>;
export function useFormAtom<T>(
	formAtom: StandardWritableAtom<T> & { init: T },
	options: FormOptions<T> & Partial<FormFieldsOptions<T, FieldsConfig<T>>>
): UseFormResult<T> | UseFormResultWithFields<T, FieldsConfig<T>> {
	const store = useStore();
	return useConstant(
		(): UseFormResult<T> | UseFormResultWithFields<T, FieldsConfig<T>> => {
			const formEvents = new FormEvents();
			const strategy = errorsStrategy(
				options.preSubmit ?? 'onSubmit',
				options.postSubmit ?? 'onBlur',
				formEvents
			);
			const atomFamily = createPathAtomFamily(formAtom);

			const result = buildFormResult<T>({
				pathPrefix: [],
				translationPath: [],
				store,
				atom: formAtom,
				atomFamily,
				schema: options.schema,
				formEvents,
				errorStrategy: strategy,
				disabledFields: toAtomFieldState(options.disabled ?? false),
				readOnlyFields: toAtomFieldState(options.readOnly ?? false),
			});

			if (!('fields' in options) || !options.fields) return result;

			const fields = buildFormFields(options.fields, result);

			return {
				...result,
				fields,
			};
		}
	);
}
