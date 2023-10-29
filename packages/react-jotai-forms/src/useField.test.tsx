import { UseUpdatableFieldResult, useField } from './useField';
import { renderHook, act, render, fireEvent } from '@testing-library/react';
import { getDefaultStore } from 'jotai';
import JotaiInput from '@principlestudios/react-jotai-form-components/input';

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
		let hook: {
			current: UseUpdatableFieldResult<
				string,
				string,
				{ hasErrors: false; hasTranslations: false }
			>;
		};
		let store: ReturnType<typeof getDefaultStore>;
		beforeEach(() => {
			const { result } = renderHook(() => useField('foo', {}));
			hook = result;

			store = getDefaultStore();
		});

		it('creates a basic field for easy use with a default value', () => {
			expect(store.get(hook.current.fieldValue)).toBe('foo');
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
			// Errors were not defined
			hook.current.errors satisfies undefined;
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
				expect(target).not.toBeNull();
				if (!target) return;
				fireEvent.change(target, { target: { value: 'foobar' } });
				expect(target).toHaveProperty('value', 'foobar');
				expect(hook.current.getValue()).toBe('foobar');
			});
		});
	});
});
