import { useStore, atom } from 'jotai';

export type SignalStore = ReturnType<typeof useStore>;

const animationRequest = atom(0);
const animationAbortController = atom(new AbortController());
const internalAnimationSignal = atom<number>(0);

const animationCounters = atom(
	(get) => get(animationRequest),
	(get, set, action: 'inc' | 'dec') => {
		if (action === 'inc') {
			set(animationRequest, (v) => {
				if (v === 0) begin();
				return v + 1;
			});
		} else {
			set(animationRequest, (v) => {
				if (v === 1) abort();
				return v - 1;
			});
		}

		function abort() {
			get(animationAbortController).abort();
		}
		function begin() {
			const abort = new AbortController();
			set(animationAbortController, (prev) => {
				prev.abort();
				return abort;
			});

			requestAnimationFrame(animate);
			function animate() {
				if (abort.signal.aborted) return;
				requestAnimationFrame(animate);
				set(internalAnimationSignal, performance.now());
			}
		}
	}
);
animationCounters.onMount = (setState) => {
	setState('inc');
	return () => setState('dec');
};

export const animationSignal = atom((get) => {
	// intentionally throwing away the underlying one - only used to trigger re-evaluations
	get(internalAnimationSignal);
	get(animationCounters);

	const result = performance.now();

	return result;
});

/** Generally, animations should subscribe for updates. If you do, you do not need this function. For some tests, I wanted to spot-check the updates; this was necessary. */
export function manuallyUpdateAnimationFrame(store: SignalStore) {
	store.set(internalAnimationSignal, performance.now());
}
