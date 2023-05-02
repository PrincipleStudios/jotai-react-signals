import { type AtomStore, getAnimationSignal } from './animation-atom';
import { atom, type Atom, type Getter } from 'jotai/vanilla';

export type EasingFunction = (amount: number) => number;

export type TweenEvents = {
	onComplete: (get: Getter, setInternal: (newValue: number) => void) => void;
	onStart: (get: Getter, startValue: number, endValue: number) => void;
};

export function tweenedSignal(
	store: AtomStore,
	original: Atom<number>,
	easing: EasingFunction,
	duration = 300,
	{ onComplete, onStart }: Partial<TweenEvents> = {}
) {
	const initial = store.get(original);
	const easingFunctionOrConst = atom<ReturnType<typeof toEased> | number>(
		initial
	);
	const result = atom((get) => {
		const funcOrConst = get(easingFunctionOrConst);
		const target = get(original);
		if (typeof funcOrConst === 'number') {
			if (target !== funcOrConst) start(get, funcOrConst, target);
			return funcOrConst;
		} else {
			const result = funcOrConst.eased(get);
			if (target !== funcOrConst.endValue) start(get, result, target);
			return result;
		}
	});

	function start(get: Getter, startValue: number, endValue: number) {
		store.set(easingFunctionOrConst, toEased(get, startValue, endValue));
		onStart?.(get, startValue, endValue);
	}

	function toEased(
		get: Getter,
		startValue: number,
		endValue: number
	): {
		eased: (get: Getter) => number;
		endValue: number;
	} {
		const startTime = getAnimationSignal(get);
		return {
			endValue,
			eased(get) {
				const timing = getAnimationSignal(get);
				const factor = Math.max(
					0,
					Math.min((timing - startTime) / duration, 1)
				);
				if (factor >= 1) {
					store.set(easingFunctionOrConst, endValue);
					onComplete?.(get, (v) => store.set(easingFunctionOrConst, v));
					return endValue;
				}
				return startValue + (endValue - startValue) * easing(factor);
			},
		};
	}

	return result;
}
