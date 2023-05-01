import { animationSignal } from './animation-atom';
import { getDefaultStore } from 'jotai';
import { RequestAnimationFrameMock } from './mocks/RequestAnimationFrameMock';

describe('animationSignal', () => {
	const mockObj = new RequestAnimationFrameMock();
	const store = getDefaultStore();
	beforeEach(() => {
		mockObj.spy();
	});

	afterEach(() => {
		mockObj?.restore();
	});

	it('registers for animation callback', () => {
		const orig = mockObj.registrationCount;
		const unsub = store.sub(animationSignal, () => void 0);

		expect(mockObj.registrationCount).toBe(orig + 1);

		unsub();
	});

	it('registers for animation callback once per store', () => {
		const orig = mockObj.registrationCount;
		const unsub = store.sub(animationSignal, () => void 0);
		const unsub2 = store.sub(animationSignal, () => void 0);

		expect(mockObj.registrationCount).toBe(orig + 1);

		unsub();
		unsub2();
	});

	it('registers for animation callback and stores values', () => {
		const targetTick = 500;
		const unsub = store.sub(animationSignal, () => void 0);

		mockObj.tick(targetTick);

		expect(store.get(animationSignal)).toBe(targetTick);
		unsub();
	});

	it('reregisters callback and continues to function', () => {
		const targetTick = 600;
		const unsub = store.sub(animationSignal, () => void 0);

		mockObj.tick(targetTick - 1);
		mockObj.tick(targetTick);

		expect(store.get(animationSignal)).toBe(targetTick);
		unsub();
	});
});
