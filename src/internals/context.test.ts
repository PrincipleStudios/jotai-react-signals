import { renderHook } from '@testing-library/react';
import { animationSignal, useAnimationSignalUpdates } from './context';
import { getDefaultStore } from 'jotai';
import { RequestAnimationFrameMock } from './mocks/RequestAnimationFrameMock';

describe('useAnimationSignalUpdates', () => {
	const mockObj = new RequestAnimationFrameMock();
	const store = getDefaultStore();
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
		renderHook(() => useAnimationSignalUpdates());

		mockObj.tick(targetTick);

		expect(mockObj.registrationCount).toBe(1);
		expect(store.get(animationSignal)).toBe(targetTick);
	});

	it('reregisters callback and continues to function', () => {
		const targetTick = 600;
		renderHook(() => useAnimationSignalUpdates());

		mockObj.tick(targetTick - 1);
		mockObj.tick(targetTick);

		expect(mockObj.registrationCount).toBe(1);
		expect(store.get(animationSignal)).toBe(targetTick);
	});
});
