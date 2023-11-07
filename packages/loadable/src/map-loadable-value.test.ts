import { makeIdle, makeError, makeLoaded, makeLoading } from './loadable';
import { mapLoadableValue } from './map-loadable-value';

describe('mapLoadableValue', () => {
	const converter = Number.parseInt;

	it('preserves an "idle" value', () => {
		const target = makeIdle();
		const actual = mapLoadableValue(target, converter);
		expect(actual).toEqual(makeIdle());
	});

	it('preserves an "error" object without an error', () => {
		const target = makeError();
		const actual = mapLoadableValue(target, converter);
		expect(actual).toEqual(makeError());
	});

	it('preserves an "error" object with an error', () => {
		const target = makeError('foobar');
		const actual = mapLoadableValue(target, converter);
		expect(actual).toEqual(makeError('foobar'));
	});

	it('converts a "loaded" value', () => {
		const target = makeLoaded('127');
		const actual = mapLoadableValue(target, converter);
		expect(actual).toEqual(makeLoaded(127));
	});

	it('converts a "loading" object with a value', () => {
		const target = makeLoading('127');
		const actual = mapLoadableValue(target, converter);
		expect(actual).toEqual(makeLoading(127));
	});

	it('preserves a "loading" object without', () => {
		const target = makeLoading();
		const actual = mapLoadableValue(target, converter);
		expect(actual).toEqual(makeLoading());
	});
});
