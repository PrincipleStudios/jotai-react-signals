import { makeIdle, makeError, makeLoaded, makeLoading } from './loadable';
import { mapLoadable } from './map-loadable';

describe('mapLoadable', () => {
	const conversionWithoutIdle: {
		idle?: () => string;
		loading: (value?: string) => string;
		loaded: (value: string) => string;
		error: (error?: unknown) => string;
	} = {
		loading: (value) => (value ? `loading ${value}` : `loading (no value)`),
		loaded: (value) => `loaded ${value}`,
		error: (error) => (error ? `error ${error}` : `error (no value)`),
	};

	describe('when no idle conversion is provided', () => {
		const conversion = conversionWithoutIdle;

		it('converts an "idle" value', () => {
			const target = makeIdle();
			const actual = mapLoadable(target, conversion);
			expect(actual).toEqual(`loading (no value)`);
		});

		it('converts an "error" object without an error', () => {
			const target = makeError();
			const actual = mapLoadable(target, conversion);
			expect(actual).toEqual(`error (no value)`);
		});

		it('converts an "error" object with an error', () => {
			const target = makeError('foobar');
			const actual = mapLoadable(target, conversion);
			expect(actual).toEqual(`error foobar`);
		});

		it('converts a "loaded" value', () => {
			const target = makeLoaded('127');
			const actual = mapLoadable(target, conversion);
			expect(actual).toEqual(`loaded 127`);
		});

		it('converts a "loading" object with a value', () => {
			const target = makeLoading('127');
			const actual = mapLoadable(target, conversion);
			expect(actual).toEqual(`loading 127`);
		});

		it('preserves a "loading" object without', () => {
			const target = makeLoading();
			const actual = mapLoadable(target, conversion);
			expect(actual).toEqual(`loading (no value)`);
		});
	});

	describe('when an idle conversion is provided', () => {
		const conversion: {
			idle?: () => string;
			loading: (value?: string) => string;
			loaded: (value: string) => string;
			error: (error?: unknown) => string;
		} = {
			...conversionWithoutIdle,
			idle: () => 'idle',
		};

		it('converts an "idle" value', () => {
			const target = makeIdle();
			const actual = mapLoadable(target, conversion);
			expect(actual).toEqual(`idle`);
		});

		it('converts an "error" object without an error', () => {
			const target = makeError();
			const actual = mapLoadable(target, conversion);
			expect(actual).toEqual(`error (no value)`);
		});

		it('converts an "error" object with an error', () => {
			const target = makeError('foobar');
			const actual = mapLoadable(target, conversion);
			expect(actual).toEqual(`error foobar`);
		});

		it('converts a "loaded" value', () => {
			const target = makeLoaded('127');
			const actual = mapLoadable(target, conversion);
			expect(actual).toEqual(`loaded 127`);
		});

		it('converts a "loading" object with a value', () => {
			const target = makeLoading('127');
			const actual = mapLoadable(target, conversion);
			expect(actual).toEqual(`loading 127`);
		});

		it('preserves a "loading" object without', () => {
			const target = makeLoading();
			const actual = mapLoadable(target, conversion);
			expect(actual).toEqual(`loading (no value)`);
		});
	});
});
