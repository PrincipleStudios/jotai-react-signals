import { useStore, atom, Getter } from 'jotai';

export type AtomStore = ReturnType<typeof useStore>;

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
				set(internalAnimationSignal, getInstantaneousAnimationSignal());
			}
		}
	}
);
animationCounters.onMount = (setState) => {
	setState('inc');
	return () => setState('dec');
};

export function getInstantaneousAnimationSignal() {
	return performance.now();
}

export function getAnimationSignal(get: Getter) {
	// intentionally throwing away the underlying one - only used to trigger re-evaluations
	get(internalAnimationSignal);
	get(animationCounters);

	const result = getInstantaneousAnimationSignal();

	return result;
}

/** @deprecated Use `getAnimationSignal`. */
export const animationSignal = atom(getAnimationSignal);

/** Generally, animations should subscribe for updates. If you do, you do not need this function. For some tests, I wanted to spot-check the updates; this was necessary. */
export function manuallyUpdateAnimationFrame(store: AtomStore) {
	store.set(internalAnimationSignal, getInstantaneousAnimationSignal());
}
