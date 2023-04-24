// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Spy<T extends (...p: any[]) => any> = T extends (
	...p: infer Params
) => infer Result
	? jest.SpyInstance<Result, Params>
	: never;
