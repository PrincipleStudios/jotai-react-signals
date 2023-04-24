import { atom, getDefaultStore } from 'jotai';
import { RequestAnimationFrameMock } from './mocks/RequestAnimationFrameMock';
import { tweenedSignal } from './tweenedSignal';
import { animationSignal, useAnimationSignalUpdates } from './context';
import { renderHook } from '@testing-library/react';

describe('tweenedSignal', () => {
	const mockObj = new RequestAnimationFrameMock();
	const store = getDefaultStore();
	const atomA = atom(0);

	beforeEach(() => {
		store.set(atomA, 0);
		mockObj.tick(0);
		mockObj.spy();
		renderHook(() => useAnimationSignalUpdates());
		store.set(animationSignal, 0);
	});

	afterEach(() => {
		mockObj?.restore();
	});

	it('defers a numeric signal based on an easing function', () => {
		const target = tweenedSignal(store, atomA, (n) => n, 300);

		expect(store.get(target)).toBe(0);
		store.set(atomA, 3);
		expect(store.get(target)).toBe(0);
		// start moving per tick
		mockObj.tick(100);
		expect(store.get(target)).toBe(1);
		mockObj.tick(200);
		expect(store.get(target)).toBe(2);
		mockObj.tick(300);
		expect(store.get(target)).toBe(3);
		// should not change or trigger subscription
		mockObj.tick(400);
		expect(store.get(target)).toBe(3);
	});

	it('triggers subscription', () => {
		const target = tweenedSignal(store, atomA, (n) => n, 300);

		const values: number[] = [];
		const spy = jest.fn(() => values.push(store.get(target)));
		// subscription does not fire when first registered
		const unsub = store.sub(target, spy);

		try {
			expect(store.get(target)).toBe(0);
			store.set(atomA, 3);
			// start moving per tick
			mockObj.tick(100);
			mockObj.tick(200);
			mockObj.tick(300);
			mockObj.tick(400);
			expect(values).toEqual([1, 2, 3]);
			expect(spy.mock.calls.length).toBe(3);
			expect(store.get(target)).toBe(3);
		} finally {
			unsub();
		}
	});

	it('accepts quadratic ease-in easing functions', () => {
		const target = tweenedSignal(store, atomA, (n) => n * n, 300);

		const values: number[] = [];
		const spy = jest.fn(() => values.push(store.get(target)));
		// subscription does not fire when first registered
		const unsub = store.sub(target, spy);

		try {
			expect(store.get(target)).toBe(0);
			store.set(atomA, 1);
			// start moving per tick
			mockObj.tick(100);
			mockObj.tick(200);
			mockObj.tick(300);
			mockObj.tick(400);
			expect(values).toEqual([1 / 9, 4 / 9, 9 / 9]);
			expect(spy.mock.calls.length).toBe(3);
			expect(store.get(target)).toBe(1);
		} finally {
			unsub();
		}
	});

	it('accepts alternate durations', () => {
		const target = tweenedSignal(store, atomA, (n) => n, 500);

		const values: number[] = [];
		const spy = jest.fn(() => values.push(store.get(target)));
		// subscription does not fire when first registered
		const unsub = store.sub(target, spy);

		try {
			expect(store.get(target)).toBe(0);
			store.set(atomA, 1);
			// start moving per tick
			mockObj.tick(100);
			mockObj.tick(200);
			mockObj.tick(300);
			mockObj.tick(400);
			mockObj.tick(500);
			mockObj.tick(600);
			expect(values).toEqual([1 / 5, 2 / 5, 3 / 5, 4 / 5, 5 / 5]);
			expect(spy.mock.calls.length).toBe(5);
			expect(store.get(target)).toBe(1);
		} finally {
			unsub();
		}
	});
});
