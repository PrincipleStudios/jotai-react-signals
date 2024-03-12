import { atom, getDefaultStore } from 'jotai';
import { getAtomOrValue } from './getAtomOrValue';

describe('getAtomOrValue', () => {
	const store = getDefaultStore();

	it('can read from a read-only atom', () => {
		const expected = 17;
		const target = atom(() => expected);
		const actual = getAtomOrValue(store.get, target);
		expect(actual).toBe(expected);
	});

	it('can read from a standard atom', () => {
		const expected = 13;
		const target = atom(expected);
		const actual = getAtomOrValue(store.get, target);
		expect(actual).toBe(expected);
	});

	it('can read a raw value', () => {
		const expected = 11;
		const target = expected;
		const actual = getAtomOrValue(store.get, target);
		expect(actual).toBe(expected);
	});

	it('can read from a standard atom that has been updated', () => {
		const expected = 7;
		const target = atom(13);
		store.set(target, expected);
		const actual = getAtomOrValue(store.get, target);
		expect(actual).toBe(expected);
	});

	it('can read an object', () => {
		const expected = { foo: 'bar' };
		const target = expected;
		const actual = getAtomOrValue(store.get, target);
		expect(actual).toBe(expected);
	});

	it('can read an atom wrapping an object', () => {
		const expected = { foo: 'bar' };
		const target = atom(expected);
		const actual = getAtomOrValue(store.get, target);
		expect(actual).toBe(expected);
	});
});
