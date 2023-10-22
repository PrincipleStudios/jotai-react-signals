import type { UseFieldResult } from '../useField';
import type { UseFieldResultFlags } from './useFieldHelpers';
import type { DefaultFormFieldResultFlags } from './useFormHelpers';
import type { UseFormResult } from './UseFormResult';

export type FormFieldReturnType<
	T,
	TFlags extends UseFieldResultFlags = DefaultFormFieldResultFlags,
> = UseFieldResult<T, TFlags> & UseFormResult<T>;
