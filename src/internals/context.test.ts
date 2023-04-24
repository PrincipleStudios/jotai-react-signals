import { renderHook } from '@testing-library/react';
import { animationSignal, useAnimationSignalUpdates } from './context';
import { getDefaultStore } from 'jotai';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Spy<T extends (...p: any[]) => any> = T extends (
	...p: infer Params
) => infer Result
	? jest.SpyInstance<Result, Params>
	: never;

class RequestAnimationFrameMock {
	private counter = 0;
	private readonly registrations = new Map<number, FrameRequestCallback>();

	public requestAnimationFrameSpy:
		| Spy<typeof requestAnimationFrame>
		| undefined;
	public cancelAnimationFrameSpy: Spy<typeof cancelAnimationFrame> | undefined;

	readonly spy = () => {
		this.requestAnimationFrameSpy = jest
			.spyOn(window, 'requestAnimationFrame')
			.mockImplementation(this.register);
		this.cancelAnimationFrameSpy = jest
			.spyOn(window, 'cancelAnimationFrame')
			.mockImplementation(this.unregister);
	};

	readonly restore = () => {
		this.requestAnimationFrameSpy?.mockRestore();
		this.cancelAnimationFrameSpy?.mockRestore();
	};

	get registrationCount() {
		return this.registrations.size;
	}

	readonly register: typeof requestAnimationFrame = (
		callback: FrameRequestCallback
	) => {
		const current = ++this.counter;
		this.registrations.set(current, callback);
		return current;
	};

	readonly unregister: typeof cancelAnimationFrame = (handle: number) => {
		this.registrations.delete(handle);
	};

	readonly tick = (time: DOMHighResTimeStamp) => {
		const callbacks = Array.from(this.registrations.values());
		this.registrations.clear();
		callbacks.forEach((cb) => cb(time));
	};
}

describe('useAnimationSignalUpdates', () => {
	const mockObj = new RequestAnimationFrameMock();
	beforeEach(() => {
		mockObj.spy();
	});

	afterEach(() => {
		mockObj?.restore();
	});

	it('registers for animation callback', () => {
		renderHook(() => useAnimationSignalUpdates());

		expect(mockObj.registrationCount).toBe(1);
	});

	it('registers for animation callback and stores values', () => {
		const targetTick = 500;
		const store = getDefaultStore();
		renderHook(() => useAnimationSignalUpdates());

		mockObj.tick(targetTick);

		expect(mockObj.registrationCount).toBe(1);
		expect(store.get(animationSignal)).toBe(targetTick);
	});

	it('reregisters callback and continues to function', () => {
		const targetTick = 600;
		const store = getDefaultStore();
		renderHook(() => useAnimationSignalUpdates());

		mockObj.tick(targetTick - 1);
		mockObj.tick(targetTick);

		expect(mockObj.registrationCount).toBe(1);
		expect(store.get(animationSignal)).toBe(targetTick);
	});
});
