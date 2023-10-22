import type { AnyArray } from './arrays';
import { isArray } from './arrays';
import type { ZodType } from 'zod';
import type { AnyPath, Path, PathValue } from '../path';
import type { FieldStateContext } from './useFieldHelpers';
import type { FieldMapping } from './FieldMapping';
import type { FieldStatePrimitive, PerFieldState } from './fieldStateTracking';
import type { Atom, Getter } from 'jotai';
import type { IfAny } from './type-helpers';

export type UnmappedFieldConfig<T, TPath extends Path<T> = Path<T>> = {
	path: TPath;
	mapping?: undefined;
};
export type MappedFieldConfig<
	T,
	TPath extends Path<T> = Path<T>,
	TValue = PathValue<T, TPath>,
> = {
	path: TPath;
	mapping: FieldMapping<PathValue<T, TPath>, TValue>;
};

export type UntypedFieldConfigObject<TValue> = {
	path: AnyPath;
	schema?: ZodType<TValue>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	mapping?: FieldMapping<any, TValue>;
};

export type FormFieldStateContext<TFormValue, TOriginalValue, TDerivedValue> = {
	get value(): TFormValue;
} & FieldStateContext<TOriginalValue, TDerivedValue>;

export type FormFieldStateCallback<
	T,
	TFormValue,
	TOriginalValue,
	TDerivedValue,
> = (
	context: FormFieldStateContext<TFormValue, TOriginalValue, TDerivedValue>,
	getter: Getter,
) => Atom<T>;

export type FormFieldStateContextAtom<
	T,
	TFormValue,
	TOriginalValue,
	TDerivedValue,
> = (
	context: FormFieldStateContext<TFormValue, TOriginalValue, TDerivedValue>,
	getter: Getter,
) => T;

export type FieldStateOverride<
	TFormValue,
	TOriginalValue,
	TDerivedValue,
	TState extends FieldStatePrimitive,
> =
	| PerFieldState<TState>
	| import('jotai').Atom<PerFieldState<TState>>
	| FormFieldStateContextAtom<
			PerFieldState<TState>,
			TFormValue,
			TOriginalValue,
			TDerivedValue
	  >;

export type FieldConfig<
	T,
	TPath extends Path<T> = Path<T>,
	TValue = PathValue<T, TPath>,
> = {
	path: TPath;
	schema?: ZodType<TValue>;
	translationPath?: AnyPath;
	disabled?: FieldStateOverride<T, PathValue<T, TPath>, TValue, boolean>;
	readOnly?: FieldStateOverride<T, PathValue<T, TPath>, TValue, boolean>;
} & IfAny<
	TValue,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	Partial<MappedFieldConfig<T, TPath, any>>,
	[PathValue<T, TPath>] extends [TValue]
		? {
				mapping?: (
					| UnmappedFieldConfig<T, TPath>
					| MappedFieldConfig<T, TPath>
				)['mapping'];
		  }
		: {
				mapping: MappedFieldConfig<T, TPath, TValue>['mapping'];
		  }
>;

/** To be used with InferredFieldConfig to defer enforcing type assignment */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFieldConfig<T> = FieldConfig<T, Path<T>, any>;
export type BaseAnyFieldConfig<T> = Path<T> | AnyFieldConfig<T>;
export type BaseAnyFieldConfigConstructor<T> =
	| BaseAnyFieldConfig<T>
	| ((...args: AnyArray) => BaseAnyFieldConfig<T>);

export type InferredFieldConfig<
	T,
	TConfig extends BaseAnyFieldConfig<T>,
> = TConfig extends FieldConfig<T, infer TPath, infer TValue>
	? FieldConfig<T, TPath, TValue>
	: Path<T>;

export type InferredFieldConfigConstructor<
	T,
	TConfig extends BaseAnyFieldConfigConstructor<T>,
> = TConfig extends ReadonlyArray<unknown>
	? Path<T>
	: InferredFieldConfigConstructorParams<T, TConfig> extends FieldConfigParams<
			T,
			infer TPath,
			infer TValue,
			infer TArgs
	  >
	? [TArgs] extends [never]
		? FieldConfig<T, TPath, TValue>
		: (...args: TArgs) => FieldConfig<T, TPath, TValue>
	: never;

/** A type that represents the generic args for a field config */
export type FieldConfigParams<
	T,
	TPath extends Path<T>,
	TValue,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TArgs extends any[] = never,
> = [T, TPath, TValue, TArgs];

/** Converts a field config into its parameters for inference */
export type InferredFieldConfigParams<
	T,
	// TODO - allow BaseAnyFieldConfigConstructor here
	TConfig extends BaseAnyFieldConfig<T>,
> = TConfig extends { path: infer TPath }
	? TPath extends Path<T>
		? TConfig extends MappedFieldConfig<T, TPath, infer TValue>
			? FieldConfigParams<T, TPath, TValue>
			: TConfig extends UnmappedFieldConfig<T, infer TPath>
			? FieldConfigParams<T, TPath, PathValue<T, TPath>>
			: { error: 'Invalid mapping' }
		: never
	: TConfig extends Path<T>
	? FieldConfigParams<T, TConfig, PathValue<T, TConfig>>
	: never;

/** Converts a FieldConfig or Path to the actual FieldConfig (object) */
export type InferredFieldConfigObject<
	T,
	TConfig extends BaseAnyFieldConfig<T>,
> = InferredFieldConfigParams<T, TConfig> extends FieldConfigParams<
	T,
	infer TPath,
	infer TValue
>
	? FieldConfig<T, TPath, TValue>
	: never;

export type InferredFieldConfigConstructorParams<
	T,
	TConfig extends BaseAnyFieldConfigConstructor<T>,
> = TConfig extends (...args: infer TArgs) => infer TReturn
	? TReturn extends BaseAnyFieldConfig<T>
		? InferredFieldConfigParams<T, TReturn> extends FieldConfigParams<
				T,
				infer TPath,
				infer TValue
		  >
			? FieldConfigParams<T, TPath, TValue, TArgs>
			: never
		: never
	: TConfig extends BaseAnyFieldConfig<T>
	? InferredFieldConfigParams<T, TConfig>
	: never;

export type FieldsConfig<T> = {
	[field: string]: BaseAnyFieldConfigConstructor<T>;
};

export function toConfigObject<T, TField extends BaseAnyFieldConfig<T>>(
	config: TField,
): InferredFieldConfigObject<T, TField>;
export function toConfigObject<T>(
	config: BaseAnyFieldConfig<T>,
): AnyFieldConfig<T>;
export function toConfigObject<T>(
	config: BaseAnyFieldConfig<T>,
): AnyFieldConfig<T> {
	if (isArray(config)) {
		return {
			path: config as Path<T>,
		};
	}
	return config;
}
