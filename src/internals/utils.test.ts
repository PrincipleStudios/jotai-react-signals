import { atom } from 'jotai';
import { isSignal } from './utils';

describe('isSignal', () => {
	it('can identify a read-only atom', () => {
		const actual = isSignal(atom(() => 0));
		expect(actual).toBeTruthy();
	});

	it('can identify a writable atom', () => {
		const actual = isSignal(atom(0));
		expect(actual).toBeTruthy();
	});

	it('rejects another object type', () => {
		const actual = isSignal({});
		expect(actual).toBeFalsy();
	});

	it('rejects a number', () => {
		const actual = isSignal(10);
		expect(actual).toBeFalsy();
	});

	it('rejects a function', () => {
		const actual = isSignal(() => void 0);
		expect(actual).toBeFalsy();
	});
});
