/* eslint-disable @typescript-eslint/no-unsafe-return */
import type { useStore } from 'jotai';
import type { MutableRefObject } from 'react';
import type { ZodType } from 'zod';
import type { StandardWritableAtom } from './StandardWritableAtom';
import type { AnyPath, Path, PathValue } from '../path';
import type { Patch, Objectish } from 'immer';
import { applyPatches } from 'immer';
import type { UseFieldResult } from '../useField';
import type {
	FieldOptions,
	UseFieldResultFlags,
	FieldStateCallback,
} from './useFieldHelpers';
import type { FieldMapping } from './FieldMapping';
import { toInternalFieldAtom } from './toInternalFieldAtom';
import { createTriggeredErrorsAtom } from './createErrorsAtom';
import type { AnyArray } from './arrays';
import type { ErrorsStrategy, RegisterErrorStrategy } from './errorsStrategy';
import { FormEvents } from '../events/FormEvents';
import { atomFamily as createAtomFamily } from 'jotai/utils';
import { getZodSchemaForPath } from './getZodSchemaForPath';
import type {
	FieldsConfig,
	FieldConfig,
	FieldStateOverride,
	BaseAnyFieldConfig,
	InferredFieldConfigParams,
	InferredFieldConfig,
	InferredFieldConfigObject,
	FieldConfigParams,
	BaseAnyFieldConfigConstructor,
} from './field-config-types';
import { toConfigObject } from './field-config-types';
import { getValueAtPath, getAtomForPath } from './getAtomForPath';
import { mapAtom, noChange } from './mapAtom';
import type {
	FieldStateAtom,
	FieldStatePrimitive,
	PerFieldState,
} from './fieldStateTracking';
import { walkFieldStateAtom, toWritableAtom } from './fieldStateTracking';
import type { FormFieldReturnType } from './FormFieldReturnType';
import type { UseFormResult } from './UseFormResult';

export type ConfiguredFormField<
	TValue,
	TArgs extends null | AnyArray,
	TFlags extends UseFieldResultFlags,
> = TArgs extends AnyArray
	? (...args: TArgs) => FormFieldReturnType<TValue, TFlags>
	: FormFieldReturnType<TValue, TFlags>;

export type DefaultFormFieldResultFlags = {
	hasErrors: true;
	hasTranslations: true;
};
type FlagsForFormFieldConfig<
	T,
	// keeping the type param for future use
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	TFieldConfig extends BaseAnyFieldConfig<T>,
> = DefaultFormFieldResultFlags;
// example usage for how these flags work
// isCheckbox: TFieldConfig extends { readonly isCheckbox?: boolean }
// 	? IfTrueThenElse<TFieldConfig['isCheckbox'], true, false>
// 	: false;

export type FormFieldReturnTypeFromConfig<
	T,
	TFieldConfig extends BaseAnyFieldConfig<T>,
> = InferredFieldConfigParams<T, TFieldConfig> extends FieldConfigParams<
	T,
	Path<T>,
	infer TValue
>
	? FormFieldReturnType<TValue, FlagsForFormFieldConfig<T, TFieldConfig>>
	: never;

export type FormFieldReturnTypeFromConfigConstructor<
	T,
	TFieldConfig extends BaseAnyFieldConfigConstructor<T>,
> = TFieldConfig extends (...args: infer TArgs) => infer TReturn
	? TReturn extends BaseAnyFieldConfig<T>
		? (...args: TArgs) => FormFieldReturnTypeFromConfig<T, TReturn>
		: never
	: TFieldConfig extends BaseAnyFieldConfig<T>
	? FormFieldReturnTypeFromConfig<T, TFieldConfig>
	: never;

export type FormFields<T, TFields extends FieldsConfig<T>> = {
	[K in keyof TFields]: FormFieldReturnTypeFromConfigConstructor<T, TFields[K]>;
};

export type FormOptions<T> = {
	schema: ZodType<T>;
	defaultValue: T;
	translation: (this: void, field: string) => string;
	preSubmit?: ErrorsStrategy;
	postSubmit?: ErrorsStrategy;
	disabled?: PerFieldState<boolean>;
	readOnly?: PerFieldState<boolean>;
};
export type FormFieldsOptions<T, TFields extends FieldsConfig<T>> = {
	fields: TFields;
};

export type AtomFamily<T> = <TPath extends Path<T>>(
	path: TPath
) => StandardWritableAtom<PathValue<T, TPath>>;

export type UseFieldsResult<
	T,
	TFields extends FieldsConfig<T> = Record<never, never>,
> = {
	fields: FormFields<T, TFields>;
};

export type UseFormResultWithFields<
	T,
	TFields extends FieldsConfig<T> = Record<never, never>,
> = UseFormResult<T> & UseFieldsResult<T, TFields>;

type BuildFormResultOptions<T> = {
	pathPrefix: AnyPath;
	translationPath: AnyPath;
	store: ReturnType<typeof useStore>;
	atom: StandardWritableAtom<T>;
	atomFamily: AtomFamily<T>;
	schema: ZodType<T>;
	formEvents: FormEvents;
	errorStrategy: RegisterErrorStrategy;
	formTranslation: (key: string) => string;
	defaultValue: MutableRefObject<T>;
	disabledFields: FieldStateAtom<boolean>;
	readOnlyFields: FieldStateAtom<boolean>;
};

export function buildFormResult<T>({
	pathPrefix,
	translationPath,
	store,
	atom,
	atomFamily,
	schema,
	formEvents,
	errorStrategy,
	formTranslation,
	defaultValue,
	disabledFields,
	readOnlyFields,
}: BuildFormResultOptions<T>): UseFormResult<T> {
	const [errors, trigger] = createTriggeredErrorsAtom(atom, schema);
	errorStrategy(formEvents, () => store.set(trigger));
	const formContext: FormResultContext<T> = {
		pathPrefix,
		translationPath,
		schema,
		errorStrategy,
		formTranslation,
		store,
		atom,
		atomFamily,
		defaultValue,
		formEvents,
		disabledFields,
		readOnlyFields,
	};
	return {
		...formContext,
		atom,
		errors,
		field<TPath extends Path<T>>(
			path: TPath
		): FormFieldReturnType<PathValue<T, TPath>, DefaultFormFieldResultFlags> {
			return toField<T, TPath, PathValue<T, TPath>>({ path }, formContext);
		},
		updateAllErrors() {
			formEvents.dispatchEvent(FormEvents.UpdateAllErrors);
		},
		get: () => store.get(atom),
		set: (value: T) => store.set(atom, value),
		handleSubmit: (callback) => async (event) => {
			formEvents.dispatchEvent(FormEvents.Submit);
			event?.preventDefault();
			const data = store.get(atom);
			const errorsResult = await schema.safeParseAsync(data);
			if (!errorsResult.success) {
				return;
			}
			await callback(errorsResult.data);
		},
	};
}

type FormResultContext<T> = Pick<
	UseFormResult<T>,
	| 'atom'
	| 'pathPrefix'
	| 'translationPath'
	| 'schema'
	| 'errorStrategy'
	| 'formTranslation'
	| 'store'
	| 'atomFamily'
	| 'defaultValue'
	| 'formEvents'
	| 'disabledFields'
	| 'readOnlyFields'
>;

export function buildFormField<T>(
	field: BaseAnyFieldConfig<T>,
	params: FormResultContext<T>
): FormFieldReturnTypeFromConfig<T, BaseAnyFieldConfig<T>>;
export function buildFormField<T, TFieldConfig extends BaseAnyFieldConfig<T>>(
	field: TFieldConfig & InferredFieldConfig<T, TFieldConfig>,
	params: FormResultContext<T>
): FormFieldReturnTypeFromConfig<T, TFieldConfig>;
export function buildFormField<T, TFieldConfig extends BaseAnyFieldConfig<T>>(
	field: TFieldConfig & InferredFieldConfig<T, TFieldConfig>,
	params: FormResultContext<T>
): FormFieldReturnTypeFromConfig<T, TFieldConfig> {
	return toField<T, TFieldConfig>(
		toConfigObject<T, TFieldConfig>(field),
		params
	);
}

export function buildFormFields<
	T,
	TFields extends FieldsConfig<T> = Record<never, never>,
>(fields: TFields, params: FormResultContext<T>): FormFields<T, TFields> {
	return Object.fromEntries(
		Object.entries(fields).map(([field, config]) => {
			if (typeof config === 'function') {
				// TODO: Not sure why this needs a conversion, there should only be one function type here
				return [
					field,
					(...args: AnyArray) =>
						buildFormField(
							(config as (...args: AnyArray) => BaseAnyFieldConfig<T>)(...args),
							params
						),
				];
			} else {
				return [field, buildFormField(config, params)];
			}
		})
	) as never as FormFields<T, TFields>;
}

function toField<T, TConfig extends BaseAnyFieldConfig<T>>(
	config: InferredFieldConfigObject<T, TConfig>,
	context: FormResultContext<T>
): FormFieldReturnTypeFromConfig<T, TConfig>;
function toField<T, TPath extends Path<T>, TValue>(
	config: FieldConfig<T, TPath, TValue>,
	context: FormResultContext<T>
): FormFieldReturnType<TValue, DefaultFormFieldResultFlags>;
function toField<T, TPath extends Path<T>, TValue>(
	config: FieldConfig<T, TPath, TValue>,
	context: FormResultContext<T>
): FormFieldReturnType<TValue, DefaultFormFieldResultFlags> {
	// Types get complex due to the PathValue<T, TPath> not always being
	// identical to TValue. Defining up top keeps things simpler.
	type CurrentPathValue = PathValue<T, TPath>;
	type Mapping = FieldMapping<CurrentPathValue, TValue> | undefined;
	type Schema = ZodType<CurrentPathValue>;

	const prevPath = context.translationPath;
	const currentPath = config.translationPath ?? (config.path as AnyPath);
	const result = toFormSubset<T, TPath, TValue>(config, context);
	const options: Partial<FieldOptions<CurrentPathValue, TValue>> = {
		mapping: config.mapping as Mapping,
		schema: getZodSchemaForPath(config.path, context.schema) as Schema,
		postMappingSchemaPrefix: [...prevPath, ...currentPath],
		postMappingSchema: config.schema,
		errorStrategy: context.errorStrategy,
		formEvents: context.formEvents,
		translation: (part) =>
			context.formTranslation(
				[
					'fields',
					...prevPath,
					...currentPath,
					...(typeof part === 'string' ? [part] : part),
				].join('.')
			),
		disabled: substateAtom(config.disabled, context.disabledFields),
		readOnly: substateAtom(config.readOnly, context.readOnlyFields),
	};
	const unmappedAtom = context.atomFamily(config.path);
	const fieldResult = toInternalFieldAtom<CurrentPathValue, TValue>(
		context.store,
		unmappedAtom,
		options
	) as UseFieldResult<TValue, DefaultFormFieldResultFlags>;

	return {
		...result,
		...fieldResult,
	};

	function substateAtom<TState extends FieldStatePrimitive>(
		value: undefined | FieldStateOverride<T, CurrentPathValue, TValue, TState>,
		state: FieldStateAtom<TState>
	):
		| FieldStateAtom<TState>
		| FieldStateCallback<PerFieldState<TState>, CurrentPathValue, TValue> {
		if (typeof value === 'function') {
			return (props, getter) =>
				value(
					{
						get value() {
							return getter(context.atom);
						},
						get original() {
							return props.original;
						},
						get mapped() {
							return props.mapped;
						},
						get errors() {
							return props.errors;
						},
					},
					getter
				);
		}
		if (value === undefined)
			// FIXME: it would be nice make these types correct and not use `as`
			return walkFieldStateAtom(state, config.path as AnyPath);
		return toWritableAtom(value);
	}
}

function toFormSubset<T, TPath extends Path<T>, TValue>(
	config: FieldConfig<T, TPath, TValue>,
	options: FormResultContext<T>
): UseFormResult<TValue> {
	const schema: ZodType<TValue> =
		config?.schema ??
		(getZodSchemaForPath(config.path, options.schema) as ZodType<TValue>);
	const unmappedAtom = options.atomFamily(config.path);
	const mapping = config.mapping as
		| FieldMapping<PathValue<T, TPath>, TValue>
		| undefined;
	const resultAtom = mapping
		? mapAtom<PathValue<T, TPath>, TValue>(
				unmappedAtom,
				mapping.toForm,
				mapping.fromForm
		  )
		: (unmappedAtom as StandardWritableAtom<TValue>);
	const atomFamily = createPathAtomFamily(resultAtom);
	// options.atomFamily([...path, ...nextPath] as never) as never;
	const resultDefaultValue = getRefForPath(config, options.defaultValue);

	return buildFormResult<TValue>({
		pathPrefix: [...options.pathPrefix, ...(config.path as AnyPath)],
		translationPath: [
			...options.translationPath,
			...(config.translationPath ?? (config.path as AnyPath)),
		],
		store: options.store,
		atom: resultAtom,
		atomFamily,
		schema,
		formEvents: options.formEvents,
		errorStrategy: options.errorStrategy,
		formTranslation: options.formTranslation,
		defaultValue: resultDefaultValue,
		disabledFields: walkFieldStateAtom(
			options.disabledFields,
			config.path as AnyPath
		),
		readOnlyFields: walkFieldStateAtom(
			options.readOnlyFields,
			config.path as AnyPath
		),
	});
}

function toJsonPointer<T>(path: Path<T>): string;
function toJsonPointer(path: AnyPath): string;
function toJsonPointer(path: AnyPath) {
	return path
		.map((v) => `${v}`.replace('~', '~0').replace('/', '~1'))
		.join('/');
}

export function createPathAtomFamily<T>(
	formAtom: StandardWritableAtom<T>
): AtomFamily<T> {
	return createAtomFamily<Path<T>, StandardWritableAtom<unknown>>(
		(path) => getAtomForPath(path, formAtom) as StandardWritableAtom<unknown>,
		(a, b) => toJsonPointer(a) === toJsonPointer(b)
	) as AtomFamily<T>;
}

function getRefForPath<T, TPath extends Path<T>, TValue>(
	config: FieldConfig<T, TPath, TValue>,
	source: React.MutableRefObject<T>
): React.MutableRefObject<TValue> {
	const mapping = config.mapping as FieldMapping<PathValue<T, TPath>, TValue>;
	const getPathValue = () =>
		getValueAtPath<T, TPath>(config.path)(source.current);

	const unmapped = {
		get current() {
			return getPathValue();
		},
		set current(value) {
			const patches: Patch[] = [
				{ op: 'replace', path: [...(config.path as AnyPath)], value },
			];
			applyPatches(getPathValue() as Objectish, patches);
		},
	};
	return mapping
		? {
				get current() {
					return mapping.toForm(unmapped.current);
				},
				set current(value) {
					const actualValue = mapping.fromForm(value);
					if (actualValue === noChange) return;
					const patches: Patch[] = [
						{
							op: 'replace',
							path: [...(config.path as AnyPath)],
							value: actualValue,
						},
					];
					applyPatches(getPathValue() as Objectish, patches);
				},
		  }
		: (unmapped as React.MutableRefObject<TValue>);
}
