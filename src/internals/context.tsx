import { useEffect } from 'react';
import { useStore, atom } from 'jotai';

export type SignalStore = ReturnType<typeof useStore>;

export const animationSignal = atom<number>(0);
animationSignal.onMount = (setState) => {
	setState(performance.now());

	const abort = new AbortController();
	function animate() {
		if (abort.signal.aborted) return;
		requestAnimationFrame(animate);
		setState(performance.now());
	}
	requestAnimationFrame(animate);
	return () => abort.abort();
};

export function useAnimationSignalUpdates() {
	const signalStore = useStore();
	useEffect(() => {
		const unsub = signalStore.sub(animationSignal, () => void 0);
		return unsub;
	});
}
