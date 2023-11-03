import type { Objectish } from 'immer';
import type {
	UseFieldsResult,
	FormFieldReturnTypeFromConfig,
} from './internals/useFormHelpers';
import type { UseFormResult } from './internals/UseFormResult';
import { buildFormField, buildFormFields } from './internals/useFormHelpers';
import type {
	BaseAnyFieldConfig,
	FieldConfig,
	FieldsConfig,
	InferredFieldConfig,
} from './internals/field-config-types';
import { useConstant } from './internals/useConstant';
import type { Path } from './path';

export function useFormFields<
	T extends Objectish,
	const TFields extends FieldsConfig<T>,
>(
	form: UseFormResult<T>,
	fields: TFields
): UseFieldsResult<T, TFields>['fields'] {
	return useConstant(() => buildFormFields<T, TFields>(fields, form));
}

// TODO - accept function callbacks
export function useFormField<
	T extends Objectish,
	TPath extends Path<T>,
	TValue,
>(
	form: UseFormResult<T>,
	field: FieldConfig<T, TPath, TValue>
): FormFieldReturnTypeFromConfig<
	T,
	BaseAnyFieldConfig<T> & FieldConfig<T, TPath, TValue>
>;
export function useFormField<
	T extends Objectish,
	const TField extends BaseAnyFieldConfig<T>,
>(
	form: UseFormResult<T>,
	field: TField & InferredFieldConfig<T, TField>
): FormFieldReturnTypeFromConfig<T, TField> {
	return useConstant(() => buildFormField<T, TField>(field, form));
}
