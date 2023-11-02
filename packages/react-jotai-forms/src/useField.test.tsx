import { UseUpdatableFieldResult, useField } from './useField';
import { renderHook, act, render, fireEvent } from '@testing-library/react';
import { getDefaultStore } from 'jotai';
import JotaiInput from '@principlestudios/react-jotai-form-components/input';
import { capitalizeMapping } from './test/capitalizeMapping';
import { integerMapping } from './test/integerMapping';

describe('useField', () => {
	describe('with a basic number construction', () => {
		let hook: {
			current: UseUpdatableFieldResult<
				number,
				number,
				{ hasErrors: boolean; hasTranslations: boolean }
			>;
		};
		let store: ReturnType<typeof getDefaultStore>;
		beforeEach(() => {
			const { result } = renderHook(() => useField(0, {}));
			hook = result;

			store = getDefaultStore();
		});

		it('creates a basic field for easy use', () => {
			expect(store.get(hook.current.fieldValue)).toBe(0);
		});

		it('can be set with a straight value', () => {
			act(() => hook.current.setValue(15));
			expect(store.get(hook.current.fieldValue)).toBe(15);
		});

		it('can be set with a callback function', () => {
			act(() => hook.current.setValue((prev) => prev + 7));
			expect(store.get(hook.current.fieldValue)).toBe(7);
		});

		it('does not have a function to get the html props', () => {
			// @ts-expect-error htmlProps should only be callable if the field is a string
			hook.current.htmlProps satisfies () => unknown;
		});
	});

	describe('with a basic string construction', () => {
		type HookType = UseUpdatableFieldResult<
			string,
			string,
			{ hasErrors: false; hasTranslations: false }
		>;
		let hook: { current: HookType };
		let store: ReturnType<typeof getDefaultStore>;
		beforeEach(() => {
			const { result } = renderHook(() => useField('foo', {}));
			hook = result;

			store = getDefaultStore();
		});

		// TS tests to verify that optional properties were not provided
		true satisfies HookType['errors'] extends undefined ? true : false;
		true satisfies HookType['schema'] extends undefined ? true : false;
		true satisfies HookType['translation'] extends undefined ? true : false;

		it('creates a basic field for easy use with a default value', () => {
			expect(store.get(hook.current.fieldValue)).toBe('foo');
		});

		it('privides an accessor for the value', () => {
			expect(hook.current.getValue()).toBe('foo');
		});

		it('can be set with a straight value', () => {
			act(() => hook.current.setValue('bar'));
			expect(store.get(hook.current.fieldValue)).toBe('bar');
		});

		it('can be set with a callback function', () => {
			act(() => hook.current.setValue((prev) => prev + 'bar'));
			expect(store.get(hook.current.fieldValue)).toBe('foobar');
		});

		it('adjust TS types to indicate no errors or translations will work', () => {
			// Errors were not defined, so these should be undefined
			hook.current.errors satisfies undefined;
			hook.current.schema satisfies undefined;

			// Translations were not defined, so the translation function should be undefined
			hook.current.translation satisfies undefined;
		});

		describe('when rendered to an input element', () => {
			it('can be rendered to an html property', () => {
				const { queryByRole } = render(
					<JotaiInput type="text" {...hook.current.htmlProps()} />
				);
				expect(queryByRole('textbox')).toHaveProperty('value', 'foo');
			});

			it('updates the html properties', () => {
				const { queryByRole } = render(
					<JotaiInput type="text" {...hook.current.htmlProps()} />
				);
				store.set(hook.current.value, 'foobar');
				expect(queryByRole('textbox')).toHaveProperty('value', 'foobar');
			});

			it('receives typed updates', () => {
				const { queryByRole } = render(
					<JotaiInput type="text" {...hook.current.htmlProps()} />
				);
				const target = queryByRole('textbox');
				if (!target) {
					expect(target).not.toBeFalsy();
					return;
				}
				fireEvent.change(target, { target: { value: 'foobar' } });
				expect(target).toHaveProperty('value', 'foobar');
				expect(hook.current.getValue()).toBe('foobar');
			});
		});

		describe('when re-mapped', () => {
			it('can be rendered to an html property', () => {
				const newResult = hook.current.applyMapping(capitalizeMapping);
				const { queryByRole } = render(
					<JotaiInput type="text" {...newResult.htmlProps()} />
				);
				expect(queryByRole('textbox')).toHaveProperty('value', 'FOO');
			});

			it('updates the html properties', () => {
				const newResult = hook.current.applyMapping({
					toForm(v) {
						return v.toUpperCase();
					},
					fromForm(v) {
						return v;
					},
				});
				const { queryByRole } = render(
					<JotaiInput type="text" {...newResult.htmlProps()} />
				);
				store.set(hook.current.value, 'foobar');
				expect(queryByRole('textbox')).toHaveProperty('value', 'FOOBAR');
			});

			it('receives typed updates', () => {
				const newResult = hook.current.applyMapping({
					toForm(v) {
						return v.toUpperCase();
					},
					fromForm(v) {
						return v;
					},
				});
				const { queryByRole } = render(
					<JotaiInput type="text" {...newResult.htmlProps()} />
				);
				const target = queryByRole('textbox');
				if (!target) {
					expect(target).not.toBeFalsy();
					return;
				}
				fireEvent.change(target, { target: { value: 'foobar' } });
				expect(target).toHaveProperty('value', 'FOOBAR');
				expect(hook.current.getValue()).toBe('foobar');
			});
		});
	});

	describe('with a basic number construction', () => {
		let hook: {
			current: UseUpdatableFieldResult<
				number,
				string,
				{ hasErrors: boolean; hasTranslations: boolean }
			>;
		};
		let store: ReturnType<typeof getDefaultStore>;
		beforeEach(() => {
			const { result } = renderHook(() =>
				useField(0, {
					mapping: integerMapping,
				})
			);
			hook = result;

			store = getDefaultStore();
		});

		it('creates a basic field for easy use', () => {
			expect(store.get(hook.current.fieldValue)).toBe(0);
		});

		it('can be set with a straight value', () => {
			act(() => store.set(hook.current.fieldValue, 15));
			expect(store.get(hook.current.fieldValue)).toBe(15);
		});

		describe('when rendered to an input element', () => {
			it('can be rendered to an html property', () => {
				const { queryByRole } = render(
					<JotaiInput type="text" {...hook.current.htmlProps()} />
				);
				expect(queryByRole('textbox')).toHaveProperty('value', '0');
			});

			it('updates the html properties', () => {
				const { queryByRole } = render(
					<JotaiInput type="text" {...hook.current.htmlProps()} />
				);
				store.set(hook.current.fieldValue, 15);
				expect(queryByRole('textbox')).toHaveProperty('value', '15');
			});

			it("updates the html properties via the form's value", () => {
				const { queryByRole } = render(
					<JotaiInput type="text" {...hook.current.htmlProps()} />
				);
				store.set(hook.current.value, '15');
				expect(queryByRole('textbox')).toHaveProperty('value', '15');
				expect(store.get(hook.current.fieldValue)).toBe(15);
			});

			it('receives typed updates', () => {
				const { queryByRole } = render(
					<JotaiInput type="text" {...hook.current.htmlProps()} />
				);
				const target = queryByRole('textbox');
				if (!target) {
					expect(target).not.toBeFalsy();
					return;
				}
				fireEvent.change(target, { target: { value: '15' } });
				expect(target).toHaveProperty('value', '15');
				expect(hook.current.getValue()).toBe('15');
				expect(store.get(hook.current.fieldValue)).toBe(15);
			});

			it('rejects invalid typed updates on blur', () => {
				const { queryByRole } = render(
					<JotaiInput type="text" {...hook.current.htmlProps()} />
				);
				const target = queryByRole('textbox');
				if (!target) {
					expect(target).not.toBeFalsy();
					return;
				}
				fireEvent.change(target, { target: { value: 'foo' } });
				expect(target).toHaveProperty('value', 'foo');
				expect(hook.current.getValue()).toBe('0');
				expect(store.get(hook.current.fieldValue)).toBe(0);
				fireEvent.blur(target);
				expect(target).toHaveProperty('value', '0');
				expect(hook.current.getValue()).toBe('0');
				expect(store.get(hook.current.fieldValue)).toBe(0);
			});
		});
	});
});
