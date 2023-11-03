import type { Atom } from 'jotai';
import type { StandardWritableAtom } from './StandardWritableAtom';
import type { CommonEventHandler } from './useFieldHelpers';

export type InputHtmlProps = {
	defaultValue: Atom<string>;
	onChange: CommonEventHandler<{ value: string }>;
	onBlur: CommonEventHandler<{ value: string }>;
	disabled: Atom<boolean>;
	readOnly: Atom<boolean>;
};
export type CheckboxHtmlProps = {
	defaultChecked: Atom<boolean>;
	onChange: CommonEventHandler<{ checked: boolean }>;
	onBlur: CommonEventHandler<{ checked: boolean }>;
	disabled: Atom<boolean>;
};
export type ControlledHtmlProps<T> = {
	value: StandardWritableAtom<T>;
	onChange: CommonEventHandler<{ value: T }>;
	onBlur: CommonEventHandler;
	disabled: Atom<boolean>;
	readOnly: Atom<boolean>;
};
