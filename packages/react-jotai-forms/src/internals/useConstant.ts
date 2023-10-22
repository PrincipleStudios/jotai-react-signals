import { useRef } from 'react';

const none = Symbol('no value');
export function useConstant<T>(factory: () => T) {
	const temp = useRef<T | typeof none>(none);
	if (temp.current === none) {
		temp.current = factory();
	}
	return temp.current;
}
