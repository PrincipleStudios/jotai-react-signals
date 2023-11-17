const idleSymbol = 'idle';
export const idle = Object.freeze({ type: idleSymbol } as const);
export type Idle = typeof idle;
export function makeIdle(): Idle {
	return idle;
}
