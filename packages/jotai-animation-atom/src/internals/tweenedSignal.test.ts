import { atom, createStore } from 'jotai';
import { RequestAnimationFrameMock } from './mocks/RequestAnimationFrameMock';
import { tweenedSignal } from './tweenedSignal';
import { manuallyUpdateAnimationFrame } from './animation-atom';

describe('tweenedSignal', () => {
	const mockObj = new RequestAnimationFrameMock();
	const atomA = atom(0);

	beforeEach(() => {
		mockObj.tick(0);
	});

	beforeAll(() => {
		mockObj.spy();
	});

	afterAll(() => {
		mockObj?.restore();
	});

	it('defers a numeric signal based on an easing function', () => {
		const store = createStore();
		const target = tweenedSignal(store, atomA, (n) => n, 300);

		expect(store.get(target)).toBe(0);
		store.set(atomA, 3);
		expect(store.get(target)).toBe(0);
		// start moving per tick
		mockObj.tick(100);
		manuallyUpdateAnimationFrame(store);
		expect(store.get(target)).toBe(1);
		mockObj.tick(200);
		manuallyUpdateAnimationFrame(store);
		expect(store.get(target)).toBe(2);
		mockObj.tick(300);
		manuallyUpdateAnimationFrame(store);
		expect(store.get(target)).toBe(3);
		// should not change or trigger subscription
		mockObj.tick(400);
		manuallyUpdateAnimationFrame(store);
		expect(store.get(target)).toBe(3);
	});

	it('triggers subscription', () => {
		const store = createStore();
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
			expect(spy).toBeCalledTimes(3);
			expect(values).toEqual([1, 2, 3]);
			expect(store.get(target)).toBe(3);
		} finally {
			unsub();
		}
	});

	it('triggers subscription with second animation', () => {
		const store = createStore();
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
			mockObj.tick(500);
			mockObj.tick(1000);

			store.set(atomA, 6);
			mockObj.tick(1100);
			mockObj.tick(1200);
			mockObj.tick(1300);
			mockObj.tick(1400);

			expect(spy).toBeCalledTimes(6);
			expect(values).toEqual([1, 2, 3, 4, 5, 6]);
			expect(store.get(target)).toBe(6);
		} finally {
			unsub();
		}
	});

	it('accepts quadratic ease-in easing functions', () => {
		const store = createStore();
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
			expect(spy).toBeCalledTimes(3);
			expect(store.get(target)).toBe(1);
		} finally {
			unsub();
		}
	});

	it('accepts alternate durations', () => {
		const store = createStore();
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
			expect(spy).toBeCalledTimes(5);
			expect(store.get(target)).toBe(1);
		} finally {
			unsub();
		}
	});

	it('notifies when animation starts', () => {
		const store = createStore();
		const onStart = jest.fn(() => void 0);
		const target = tweenedSignal(store, atomA, (n) => n, 300, {
			onStart,
		});

		const values: number[] = [];
		const spy = jest.fn(() => values.push(store.get(target)));
		// subscription does not fire when first registered
		const unsub = store.sub(target, spy);

		try {
			expect(store.get(target)).toBe(0);
			expect(onStart).toBeCalledTimes(0);
			store.set(atomA, 3);
			expect(onStart).toBeCalledTimes(1);
		} finally {
			unsub();
		}
	});

	it('notifies when animation ends', () => {
		const store = createStore();
		const onComplete = jest.fn(() => void 0);
		const target = tweenedSignal(store, atomA, (n) => n, 300, {
			onComplete,
		});

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
			expect(onComplete).toBeCalledTimes(0);
			mockObj.tick(300);
			expect(onComplete).toBeCalledTimes(1);
			mockObj.tick(400);
			expect(spy).toBeCalledTimes(3);
			expect(values).toEqual([1, 2, 3]);
			expect(store.get(target)).toBe(3);
		} finally {
			unsub();
		}
	});
});
