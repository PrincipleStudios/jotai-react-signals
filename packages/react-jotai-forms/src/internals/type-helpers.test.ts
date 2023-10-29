/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
	IfTrueThenProp,
	IfTrueThenElse,
	IfAny,
	IsAny,
} from './type-helpers';

describe('type-helpers', () => {
	describe('IfTrueThenProp', () => {
		type PropTest<TFlag extends boolean | undefined> = IfTrueThenProp<
			TFlag,
			{ t: true }
		>;
		it('selects the "true" props when true', () => {
			const _1 = { t: true } satisfies PropTest<true>;
			// "undefined" is not a valid value for the 't' property of the result
			false satisfies undefined extends PropTest<true>['t'] ? true : false;
		});

		it('selects the "false" props when false', () => {
			const _1: PropTest<false> = {};
			const _2: PropTest<false> = { t: undefined };
			// "true" is not a valid value for the 't' property of the result
			false satisfies true extends PropTest<false>['t'] ? true : false;
		});

		it('selects partial props of each when "boolean" or "undefined"', () => {
			const _1 = {} satisfies PropTest<boolean>;
			const _2 = { t: true } satisfies PropTest<boolean>;
			const _3 = { t: undefined } satisfies PropTest<boolean>;
			// "undefined" is not a valid value for the 't' property of the result
			true satisfies undefined extends PropTest<boolean>['t'] ? true : false;
			// 't' is a valid property for PropTest
			true satisfies 't' extends keyof PropTest<boolean> ? true : false;
		});

		it('allows the resulting type to infer', () => {
			const result = ((): IfTrueThenProp<boolean, { one: 1; two: 2 }> => {
				// This result is only for use checking TS inference with this type
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				return null as any;
			})();

			if (result.one === 1) {
				// If it knows one, it knows two, and since one is 1, two is 2.
				const result2: { one: 1; two: 2 } = result;
				true satisfies (typeof result)['one'] extends 1 ? true : false;
				false satisfies (typeof result)['one'] extends undefined ? true : false;
				true satisfies (typeof result)['two'] extends 2 ? true : false;
				false satisfies (typeof result)['two'] extends undefined ? true : false;
			} else {
				// If it knows one, it knows two, and since one is undefined, two is undefined.
				const result2: { one?: undefined; two?: undefined } = result;
				false satisfies (typeof result)['one'] extends 1 ? true : false;
				true satisfies (typeof result)['one'] extends undefined ? true : false;
				false satisfies (typeof result)['two'] extends 2 ? true : false;
				true satisfies (typeof result)['two'] extends undefined ? true : false;
			}
		});
	});
});
