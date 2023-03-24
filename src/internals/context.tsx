import { useEffect } from 'react';
import { createStore, useStore, Provider, atom } from 'jotai';

export type SignalStore = ReturnType<typeof createStore>;
const signalStore: SignalStore = createStore();

export const animationSignal = atom<number>(0);

export function useSignalStore() {
	return useStore();
}

export function SignalProvider({ children }: { children?: React.ReactNode }) {
	useEffect(() => {
		const abort = new AbortController();
		function animate(time: number) {
			if (abort.signal.aborted) return;
			requestAnimationFrame(animate);
			signalStore.set(animationSignal, time);
		}
		requestAnimationFrame(animate);
		return () => abort.abort();
	}, []);
	return <Provider store={signalStore}>{children}</Provider>;
}
