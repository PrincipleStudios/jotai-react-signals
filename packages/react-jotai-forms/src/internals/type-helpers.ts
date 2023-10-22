export type IfTrueThenProp<
	T extends boolean | undefined,
	TProp,
> = T extends true
	? TProp
	: T extends false | undefined
	? object
	: Partial<TProp>;

export type IfTrueThenElse<
	T extends boolean | undefined,
	TIfTrue,
	TIfFalse,
> = T extends true
	? TIfTrue
	: T extends false | undefined
	? TIfFalse
	: TIfTrue | TIfFalse;

export type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
export type IsAny<T> = IfAny<T, true, never>;
