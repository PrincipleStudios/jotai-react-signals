import type { Getter } from 'jotai';
import { atom } from 'jotai';
import type { ZodError, ZodType } from 'zod';
import type { Loadable } from 'jotai/vanilla/utils/loadable';
import type { RegisterErrorStrategy } from './errorsStrategy';
import type { FormEvents } from '../events/FormEvents';
import type { IfTrueThenProp } from './type-helpers';
import type { FieldStateAtom, PerFieldState } from './fieldStateTracking';
import type { FieldMapping } from './FieldMapping';
import type {
	CheckboxHtmlProps,
	ControlledHtmlProps,
	InputHtmlProps,
} from './HtmlProps';
import type { FieldTranslation } from './FieldTranslation';
import type { ErrorsAtom } from './ErrorsAtom';
import { AnyPath } from '../path';

export type UseFieldResultFlags = {
	hasErrors: boolean;
	hasTranslations: boolean;
};
export type ToHtmlInputProps<TInputValue> = TInputValue extends string
	? () => InputHtmlProps
	: object;

export type ToHtmlProps<TInputValue> = ToHtmlInputProps<TInputValue> & {
	asControlled: () => ControlledHtmlProps<TInputValue>;
	asCheckbox: TInputValue extends boolean ? () => CheckboxHtmlProps : undefined;
};

export type CommonEventHandler<TTarget = never> = [TTarget] extends [never]
	? () => void
	: (ev: { currentTarget: TTarget }) => void;

//
export const noErrorsAtom: ErrorsAtom = atom({ state: 'hasData', data: null });
export type FieldStateContext<TOriginalValue, TDerivedValue> = {
	get original(): TOriginalValue;
	get mapped(): TDerivedValue;
} & IfTrueThenProp<
	true /* TODO: take flags into account: TFlags['hasErrors'] */,
	{ get errors(): Loadable<ZodError | null> }
>;

export type FieldStateCallback<T, TOriginalValue, TDerivedValue> = (
	context: FieldStateContext<TOriginalValue, TDerivedValue>,
	get: Getter
) => T;

export type FieldOptions<TValue, TFormFieldValue> = {
	schema: ZodType<TValue>;
	mapping: FieldMapping<TValue, TFormFieldValue>;
	postMappingSchemaPrefix: AnyPath;
	postMappingSchema: ZodType<TFormFieldValue>;
	errorStrategy: RegisterErrorStrategy;
	formEvents: FormEvents;
	translation: FieldTranslation;
	disabled:
		| FieldStateAtom<boolean>
		| FieldStateCallback<PerFieldState<boolean>, TValue, TFormFieldValue>;
	readOnly:
		| FieldStateAtom<boolean>
		| FieldStateCallback<PerFieldState<boolean>, TValue, TFormFieldValue>;
};
export type UnmappedOptions<TValue> = Partial<FieldOptions<TValue, TValue>> & {
	mapping?: never;
	postMappingSchema?: never;
};
export type MappedOptions<TValue, TFieldValue> = Partial<
	FieldOptions<TValue, TFieldValue>
> & {
	mapping: FieldMapping<TValue, TFieldValue>;
	postMappingSchema?: ZodType<TFieldValue>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFieldOptions = FieldOptions<any, any>;
export type Flags<TOptions extends Partial<AnyFieldOptions>> = {
	hasErrors: 'schema' extends keyof TOptions ? true : false;
	hasTranslations: TOptions['translation'] extends FieldTranslation
		? true
		: false;
};
