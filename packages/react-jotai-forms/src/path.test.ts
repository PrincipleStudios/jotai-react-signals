import type { Path, PathValue } from './path';

type IsExactType<A, B> = [A] extends [B]
	? [B] extends [A]
		? true
		: false
	: false;

describe('TypeScript path utilities', () => {
	/**
	 * TS tests to demonstrate uses of paths - none of these jest tests assert
	 * anything, but instead give TS errors if they are not correct */

	describe('object paths', () => {
		type Target = {
			name: string;
			bio: { age?: number };
			items: { type: string }[];
		};
		it('can specify a regular path', () => {
			['name'] satisfies Path<Target>;
			true satisfies IsExactType<PathValue<Target, ['name']>, string>;
		});

		it('can specify a nested path', () => {
			['bio', 'age'] satisfies Path<Target>;
			true satisfies IsExactType<
				PathValue<Target, ['bio', 'age']>,
				number | undefined
			>;
		});

		it('can specify an item in a nested array', () => {
			['items', 0] satisfies Path<Target>;
			true satisfies IsExactType<
				PathValue<Target, ['items', 0]>,
				{ type: string }
			>;
		});

		it('can specify property within a nested array', () => {
			['items', 0, 'type'] satisfies Path<Target>;
			true satisfies IsExactType<
				PathValue<Target, ['items', 0, 'type']>,
				string
			>;
		});

		it('allows an empty path', () => {
			[] satisfies Path<Target>;
			true satisfies IsExactType<PathValue<Target, []>, Target>;
		});
	});

	describe('array paths', () => {
		type Target = { type: string }[];
		it('can specify which item in an array', () => {
			[0] satisfies Path<Target>;
			true satisfies IsExactType<PathValue<Target, [0]>, { type: string }>;
		});
		it('can specify a nested path', () => {
			[0, 'type'] satisfies Path<Target>;
			true satisfies IsExactType<PathValue<Target, [0, 'type']>, string>;
		});
		it('highlights errors', () => {
			// @ts-expect-error type is not top level
			['type'] satisfies Path<Target>;
			// @ts-expect-error foo is not a nested property
			[0, 'foo'] satisfies Path<Target>;
		});

		it('allows an empty path', () => {
			[] satisfies Path<Target>;
			true satisfies IsExactType<PathValue<Target, []>, Target>;
		});

		function generic<T>() {
			it('allows an arbitrary path with a T[]', () => {
				[0] satisfies Path<T[]>;
				true satisfies IsExactType<PathValue<T[], readonly [number]>, T>;
			});
		}
		generic();
	});

	describe('primitive paths', () => {
		type Target = string;

		it('disallows properties on string', () => {
			// @ts-expect-error length is not a valid property
			['length'] satisfies Path<Target>;
			// @ts-expect-error cannot access a character in a string
			[0] satisfies Path<Target>;
		});

		it('allows an empty path', () => {
			[] satisfies Path<Target>;
			true satisfies IsExactType<PathValue<Target, []>, Target>;
		});
	});
});
