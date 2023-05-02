import { getAnimationSignal, setterContainer } from './animation-atom';
import { atom, type Setter, type Atom, type Getter } from 'jotai/vanilla';

export type EasingFunction = (amount: number) => number;

export type TweenEvents = {
	onComplete: (get: Getter, setInternal: (newValue: number) => void) => void;
	onStart: (get: Getter, startValue: number, endValue: number) => void;
};

type Tweening = {
	endValue?: number;
	isComplete: (get: Getter) => boolean;
	eased: (get: Getter) => number;
};

export function tweenedAtom(
	original: Atom<number>,
	easing: EasingFunction,
	duration = 300,
	{ onComplete, onStart }: Partial<TweenEvents> = {}
): Atom<number> {
	const easingFunctionOrConst = atom<Tweening | number | undefined>(undefined);
	const result = atom(
		(get) => {
			const set = get(setterContainer);
			const funcOrConst = get(easingFunctionOrConst);
			const target = get(original);
			if (!set) {
				// Warning: cannot animate if not subscribed
				// Not throwing here, though, because SSG and SSR would require side-effects in some cases to make this work.
				return target;
			}
			if (typeof funcOrConst === 'undefined') {
				set(easingFunctionOrConst, target);
				return target;
			} else if (typeof funcOrConst === 'number') {
				if (target !== funcOrConst) start(get, set, funcOrConst, target);
				return funcOrConst;
			} else {
				const result = funcOrConst.eased(get);
				if (target !== funcOrConst.endValue) start(get, set, result, target);
				else if (funcOrConst.isComplete(get)) {
					set(easingFunctionOrConst, result);
					onComplete?.(get, (v) => set(easingFunctionOrConst, v));
				}
				return result;
			}
		},
		(get, set) => {
			set(setterContainer, (s: Setter | undefined) => s ?? set);
		}
	);
	result.onMount = (setter) => setter();

	function start(
		get: Getter,
		set: Setter,
		startValue: number,
		endValue: number
	) {
		set(easingFunctionOrConst, toEased(get, startValue, endValue));
		onStart?.(get, startValue, endValue);
	}

	function toEased(
		get: Getter,
		startValue: number,
		endValue: number
	): Tweening {
		const startTime = getAnimationSignal(get);
		return {
			endValue,
			isComplete(get) {
				const timing = getAnimationSignal(get);
				return timing - startTime >= duration;
			},
			eased(get) {
				const timing = getAnimationSignal(get);
				const factor = Math.max(
					0,
					Math.min((timing - startTime) / duration, 1)
				);
				if (factor >= 1) {
					return endValue;
				}
				return startValue + (endValue - startValue) * easing(factor);
			},
		};
	}

	return result;
}
