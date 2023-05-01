import { renderHook } from '@testing-library/react';
import { atom, getDefaultStore } from 'jotai';
import { useAsAtom, useComputedAtom } from './hooks';

describe('useComputedAtom', () => {
	const store = getDefaultStore();
	const atomA = atom(0);
	const atomB = atom(0);

	beforeEach(() => {
		store.set(atomA, 0);
		store.set(atomB, 0);
	});

	function renderComputedSignalHook<T>(
		...p: Parameters<typeof useComputedAtom<T>>
	) {
		return renderHook(
			(p: Parameters<typeof useComputedAtom<T>>) => useComputedAtom<T>(...p),
			{
				initialProps: p,
			}
		);
	}

	it('calculates an original value', () => {
		const { result } = renderComputedSignalHook((get) => get(atomA));

		store.set(atomA, 15);

		expect(store.get(result.current)).toBe(15);
	});

	it('handles updates', () => {
		const { result } = renderComputedSignalHook((get) => get(atomA));

		store.set(atomA, 15);
		store.set(atomA, 5);

		expect(store.get(result.current)).toBe(5);
	});

	it('can be updated to a different formula', () => {
		const { result, rerender } = renderComputedSignalHook((get) => get(atomA));

		store.set(atomA, 15);
		store.set(atomB, 5);

		rerender([(get) => get(atomB)]);

		expect(store.get(result.current)).toBe(5);
	});

	it('triggers subscriptions', () => {
		const values: number[] = [];
		const { result, rerender } = renderComputedSignalHook((get) => get(atomA));
		const spy = jest.fn(() => values.push(store.get(result.current)));
		// subscription does not fire when first registered
		const unsub = store.sub(result.current, spy);

		try {
			// triggers a single atom value change
			store.set(atomA, 15);
			store.set(atomB, 15);

			rerender([(get) => get(atomB)]);
			// triggers the second atom value change
			store.set(atomB, 5);

			expect(spy.mock.calls.length).toEqual(2);
			expect(values).toEqual([15, 5]);
		} finally {
			unsub();
		}
	});
});

describe('useAsAtom', () => {
	const store = getDefaultStore();
	const atomA = atom(0);

	beforeEach(() => {
		store.set(atomA, 0);
	});

	function renderAsAtomHook<T>(...p: Parameters<typeof useAsAtom<T>>) {
		return renderHook(
			(p: Parameters<typeof useAsAtom<T>>) => useAsAtom<T>(...p),
			{
				initialProps: p,
			}
		);
	}

	it('calculates a raw value', () => {
		const { result } = renderAsAtomHook(15);

		expect(store.get(result.current)).toBe(15);
	});

	it('from an atom value', () => {
		const { result } = renderAsAtomHook(atomA);

		expect(store.get(result.current)).toBe(0);
		store.set(atomA, 15);
		expect(store.get(result.current)).toBe(15);
	});

	it('can be updated to a different value', () => {
		const { result, rerender } = renderAsAtomHook(5);

		rerender([10]);

		expect(store.get(result.current)).toBe(10);
	});

	it('can be updated to a different atom', () => {
		const { result, rerender } = renderAsAtomHook(5);

		rerender([atomA]);

		store.set(atomA, 15);
		expect(store.get(result.current)).toBe(15);
		store.set(atomA, 25);
		expect(store.get(result.current)).toBe(25);
	});

	it('triggers subscriptions', () => {
		const values: number[] = [];
		const { result, rerender } = renderAsAtomHook(5);
		const spy = jest.fn(() => values.push(store.get(result.current)));
		// subscription does not fire when first registered
		const unsub = store.sub(result.current, spy);

		try {
			store.set(atomA, 15);

			// triggers a single atom value change
			rerender([atomA]);
			// triggers the second atom value change
			store.set(atomA, 25);

			rerender([25]);
			// triggers the third atom value change
			rerender([35]);

			expect(spy.mock.calls.length).toEqual(3);
			expect(values).toEqual([15, 25, 35]);
		} finally {
			unsub();
		}
	});
});
