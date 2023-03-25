import { useEffect } from 'react';
import { useStore, atom } from 'jotai';

export type SignalStore = ReturnType<typeof useStore>;

export const animationSignal = atom<number>(0);

export function useAnimationSignalUpdates() {
	const signalStore = useStore();
	useEffect(() => {
		const abort = new AbortController();
		function animate(time: number) {
			if (abort.signal.aborted) return;
			requestAnimationFrame(animate);
			signalStore.set(animationSignal, time);
		}
		requestAnimationFrame(animate);
		return () => abort.abort();
	}, [signalStore]);
}
