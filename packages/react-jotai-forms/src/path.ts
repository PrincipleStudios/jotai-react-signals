import type { IfAny } from './internals/type-helpers';

/* eslint-disable @typescript-eslint/no-explicit-any */
type IsEqual<T1, T2> = T1 extends T2
	? (<G>() => G extends T1 ? 1 : 2) extends <G>() => G extends T2 ? 1 : 2
		? true
		: false
	: false;

type Primitive = null | undefined | string | number | boolean | symbol | bigint;

type BrowserNativeObject = Date | FileList | File;

type ArrayKey = number;
type IsTuple<T extends ReadonlyArray<any>> = number extends T['length']
	? false
	: true;
type TupleKeys<T extends ReadonlyArray<any>> = Exclude<keyof T, keyof any[]>;
type AnyIsEqual<T1, T2> = T1 extends T2
	? IsEqual<T1, T2> extends true
		? true
		: never
	: never;
type PathImpl<K extends string | number, V, TraversedTypes> =
	| readonly [K]
	| (V extends Primitive | BrowserNativeObject
			? never
			: // Check so that we don't recurse into the same type
			// by ensuring that the types are mutually assignable
			// mutually required to avoid false positives of subtypes
			true extends AnyIsEqual<TraversedTypes, V>
			? never
			: readonly [K, ...PathInternal<V, TraversedTypes | V>]);
type PathInternal<T, TraversedTypes = T> = T extends ReadonlyArray<infer V>
	? IsTuple<T> extends true
		? {
				[K in TupleKeys<T>]-?: PathImpl<K & string, T[K], TraversedTypes>;
		  }[TupleKeys<T>]
		: PathImpl<ArrayKey, V, TraversedTypes>
	: {
			[K in keyof T]-?: PathImpl<K & string, T[K], TraversedTypes>;
	  }[keyof T];

export type Path<T> =
	| readonly []
	| IfAny<T, any, T extends any ? PathInternal<T> : never>;
export type PathValue<T, P extends Path<T>> = IfAny<
	P,
	any,
	P extends readonly []
		? T
		: T extends any
		? P extends readonly [infer K]
			? K extends keyof T
				? T[K]
				: K extends ArrayKey
				? T extends ReadonlyArray<infer V>
					? V
					: never
				: never
			: P extends readonly [infer K, ...infer R]
			? K extends keyof T
				? R extends Path<T[K]>
					? PathValue<T[K], R>
					: T[K]
				: K extends ArrayKey
				? T extends ReadonlyArray<infer V>
					? PathValue<V, R & Path<V>>
					: never
				: never
			: never
		: never
>;
export type AnyPath = ReadonlyArray<string | number>;
