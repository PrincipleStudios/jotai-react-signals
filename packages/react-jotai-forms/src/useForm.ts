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

export function useForm<T>(options: FormOptions<T>): UseFormResult<T>;
export function useForm<T, const TFields extends FieldsConfig<T>>(
	options: FormOptions<T> & FormFieldsOptions<T, TFields>,
): UseFormResultWithFields<T, TFields>;
export function useForm<T>(
	options: FormOptions<T> & Partial<FormFieldsOptions<T, FieldsConfig<T>>>,
): UseFormResult<T> | UseFormResultWithFields<T, FieldsConfig<T>> {
	const store = useStore();
	return useConstant(
		(): UseFormResult<T> | UseFormResultWithFields<T, FieldsConfig<T>> => {
			const formEvents = new FormEvents();
			const strategy = errorsStrategy(
				options.preSubmit ?? 'onSubmit',
				options.postSubmit ?? 'onBlur',
				formEvents,
			);
			const formAtom = atom(options.defaultValue);
			const atomFamily = createPathAtomFamily(formAtom);

			const defaultValue = {
				get current(): T {
					return formAtom.init;
				},
				set current(value) {
					formAtom.init = value;
				},
			};

			const result = buildFormResult<T>({
				pathPrefix: [],
				translationPath: [],
				store,
				atom: formAtom,
				atomFamily,
				schema: options.schema,
				formEvents,
				errorStrategy: strategy,
				formTranslation: options.translation,
				defaultValue,
				disabledFields: toAtomFieldState(options.disabled ?? false),
				readOnlyFields: toAtomFieldState(options.readOnly ?? false),
			});

			if (!('fields' in options) || !options.fields) return result;

			const fields = buildFormFields(options.fields, result);

			return {
				...result,
				fields,
			};
		},
	);
}
