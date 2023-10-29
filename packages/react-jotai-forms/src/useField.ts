import type { Atom, PrimitiveAtom } from 'jotai';
import { atom, useStore } from 'jotai';
import { useMemo } from 'react';
import type { ZodType } from 'zod';
import type { StandardWritableAtom } from './internals/StandardWritableAtom';
import { toInternalFieldAtom } from './internals/toInternalFieldAtom';
import { useConstant } from './internals/useConstant';
import type {
	UnmappedOptions,
	Flags,
	MappedOptions,
	FieldOptions,
	ToHtmlProps,
} from './internals/useFieldHelpers';
import type { ErrorsAtom } from './internals/ErrorsAtom';
import type { FieldTranslation } from './internals/FieldTranslation';
import type { FieldMapping } from './internals/FieldMapping';
import type { UseFieldResultFlags } from './internals/useFieldHelpers';
import type { IfTrueThenProp } from './internals/type-helpers';

/**
 * Represents the result of using a form field with various properties and methods.
 *
 * @template TFieldValue - The type of the field's value.
 * @template TFlags - The type of flags associated with the field (defaulting to an unknown set of flags).
 */
export type UseFieldResult<
	TFieldValue,
	TFlags extends UseFieldResultFlags = UseFieldResultFlags,
> = {
	/** An atom representing the field's value. */
	value: PrimitiveAtom<TFieldValue>;
	/** An atom representing whether the field is disabled. */
	disabled: Atom<boolean>;
	/** An atom representing whether the field is read-only. */
	readOnly: Atom<boolean>;
	/** A function to set the field's value. */
	setValue(v: TFieldValue | ((prev: TFieldValue) => TFieldValue)): void;
	/** A function to get the field's value. */
	getValue(): TFieldValue;
	/** A function to handle field value change. */
	onChange(
		this: void,
		v: TFieldValue | ((prev: TFieldValue) => TFieldValue)
	): void;
	/** A function to handle the field's blur event. */
	onBlur(this: void): void;
	/** Functions to convert the field to be usable with an HTML element. */
	htmlProps: ToHtmlProps<TFieldValue>;
	/** A function to apply a mapping to the field's value. */
	applyMapping<TNewValue>(
		mapping: FieldMapping<TFieldValue, TNewValue>
	): UseFieldResult<TNewValue, TFlags>;
} & IfTrueThenProp<
	TFlags['hasErrors'],
	{
		/** The Zod schema associated with the field. (Conditional property, only present if a schema was provided when the form or field was set up.) */
		schema: ZodType<TFieldValue>;
		/** An atom representing field errors. (Conditional property, only present if a schema was provided when the form or field was set up.) */
		errors: ErrorsAtom;
	}
> &
	IfTrueThenProp<
		TFlags['hasTranslations'],
		{
			/** The translation information for the field. (Conditional property, only present if a translation function was provided when the form or field was set up.) */
			translation: FieldTranslation;
		}
	>;

export type UseUpdatableFieldResult<
	TValue,
	TFieldValue,
	TFlags extends UseFieldResultFlags = UseFieldResultFlags,
> = UseFieldResult<TFieldValue, TFlags> & {
	/** The value of the actual field */
	fieldValue: StandardWritableAtom<TValue>;
};

function useInternalFieldAtom<TValue, TFieldValue>(
	fieldValueAtom: StandardWritableAtom<TValue>,
	options: Partial<FieldOptions<TValue, TFieldValue>> = {}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): UseFieldResult<TFieldValue, any> {
	const store = useStore();
	return useMemo(
		() => toInternalFieldAtom(store, fieldValueAtom, options),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[store, fieldValueAtom]
	);
}

/**
 * Manages a single field's state, separating the underlying value from the value used for further operations, such as binding to HTML.
 *
 * @template TValue - The underlying value for the field.
 * @template TOptions - The type of field options, extending UnmappedOptions<TValue> or MappedOptions<TValue, any>.
 *
 * @param {TValue} defaultValue - The default value for the field.
 * @param {TOptions} [options] - Optional field options, extending UnmappedOptions<TValue> or MappedOptions<TValue, TFieldValue>.
 * @returns {UseFieldResult<TFieldValue, Flags<TOptions>>} - The field operations.
 */
export function useField<
	TValue,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const TOptions extends UnmappedOptions<TValue> | MappedOptions<TValue, any>,
>(
	defaultValue: TValue,
	options: TOptions
): TOptions extends MappedOptions<TValue, infer TFieldValue>
	? UseUpdatableFieldResult<TValue, TFieldValue, Flags<TOptions>>
	: UseUpdatableFieldResult<TValue, TValue, Flags<TOptions>>;
export function useField<TValue, TFieldValue>(
	defaultValue: TValue,
	options: Partial<FieldOptions<TValue, TFieldValue>> = {}
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
): UseUpdatableFieldResult<TValue, TFieldValue, any> {
	const fieldValueAtom = useConstant(() => atom<TValue>(defaultValue));
	return {
		...useInternalFieldAtom(fieldValueAtom, options),
		fieldValue: fieldValueAtom,
	};
}
