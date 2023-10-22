import { atom } from 'jotai';
import { isAtom } from './isAtom';

describe('isAtom', () => {
	it('can identify a read-only atom', () => {
		const actual = isAtom(atom(() => 0));
		expect(actual).toBeTruthy();
	});

	it('can identify a writable atom', () => {
		const actual = isAtom(atom(0));
		expect(actual).toBeTruthy();
	});

	it('rejects another object type', () => {
		const actual = isAtom({});
		expect(actual).toBeFalsy();
	});

	it('rejects a number', () => {
		const actual = isAtom(10);
		expect(actual).toBeFalsy();
	});

	it('rejects a function', () => {
		const actual = isAtom(() => void 0);
		expect(actual).toBeFalsy();
	});
});
