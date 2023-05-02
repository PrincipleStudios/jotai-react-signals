import { useStore } from 'jotai';
import type { Atom, Getter } from 'jotai';
import {
	createElement,
	CSSProperties,
	forwardRef,
	useRef,
	useEffect,
	memo,
} from 'react';
import { isAtom } from './utils';
import {
	mapStyle,
	type MappingKeys,
	type CompleteMapping,
	type AnyIntrinsicElementTag,
	type AnyIntrinsicElement,
	type RefType,
} from './withSignal.mappings';

type AtomStore = ReturnType<typeof useStore>;

function difference<T>(arr1: T[], arr2: T[]) {
	return arr1.filter((x) => !arr2.includes(x));
}

type MaybeSignal<T> = T | Atom<T>;

type CSSPropertiesWithSignal = {
	[K in keyof CSSProperties | `--${string}`]?: K extends `--${string}`
		? string | number | Atom<string | null>
		: K extends keyof CSSProperties
		? CSSProperties[K] | Atom<string | null>
		: never;
};

type WithSignalProps<
	T extends AnyIntrinsicElement,
	TMapped extends MappingKeys
> = {
	[K in keyof T]: K extends 'style'
		? T[K] extends CSSProperties | undefined
			? CSSPropertiesWithSignal | undefined
			: T[K]
		: K extends TMapped
		? MaybeSignal<T[K]>
		: T[K];
};

function toPropsObj<
	T extends { style?: CSSProperties },
	TMapped extends MappingKeys
>(get: Getter, props: WithSignalProps<T, TMapped>): T {
	return Object.fromEntries(
		Object.entries(props).map(([key, value]) => {
			if (isAtom(value)) return [key, get(value as Atom<unknown>)];
			if (key === 'style')
				return [
					'style',
					Object.fromEntries(
						Object.entries(value).map(([k, v]) => [k, isAtom(v) ? get(v) : v])
					),
				];
			return [key, value];
		})
	) as T;
}

function useCombinedRefs<T>(...refs: React.ForwardedRef<T>[]) {
	const targetRef = useRef();

	useEffect(() => {
		refs.forEach((ref) => {
			if (!ref) return;

			if (typeof ref === 'function') {
				ref(targetRef.current ?? null);
			} else {
				ref.current = targetRef.current ?? null;
			}
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps

		return () => {
			refs.forEach((ref) => {
				if (!ref) return;

				if (typeof ref === 'function') {
					ref(null);
				} else {
					ref.current = null;
				}
			});
		};
	}, refs);

	return targetRef;
}

function toUpdater<TMapped extends MappingKeys>(
	elem: Element & ElementCSSInlineStyle,
	key: string,
	map: CompleteMapping<TMapped>
): (value: unknown) => void {
	if (key.startsWith('style.')) {
		const stylePart = key.split('.')[1];
		return mapStyle(stylePart)(elem);
	} else if (key in map) {
		return map[key as keyof typeof map](elem);
	}
	console.warn(`unknown key, unable to treat as signal:`, elem, key);
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	return () => {};
}

type Unsubscribe = () => void;

function setupSetter<TMapped extends MappingKeys>(
	map: CompleteMapping<TMapped>,
	elem: Element & ElementCSSInlineStyle,
	store: AtomStore,
	key: string,
	value: Atom<unknown>
): Unsubscribe {
	const applyUpdate = toUpdater(elem, key, map);
	applyUpdate(store.get(value));
	const unsub = store.sub(value, () => {
		applyUpdate(store.get(value));
	});
	return unsub;
}

type SignalEntry = [key: string, value: Atom<unknown>];
function toSignalEntries<
	T extends AnyIntrinsicElementTag,
	TMapped extends MappingKeys
>(target: WithSignalProps<JSX.IntrinsicElements[T], TMapped>): SignalEntry[] {
	return Object.entries(target).flatMap(([key, value]): SignalEntry[] => {
		if (isAtom(value)) return [[key, value]];
		else if (key === 'style')
			return Object.entries(value).flatMap(([key, value]): SignalEntry[] => {
				if (isAtom(value)) return [[`style.${key}`, value]];
				return [];
			});
		else return [];
	});
}

export function withSignal<
	T extends AnyIntrinsicElementTag,
	TMapped extends MappingKeys
>(
	elem: T,
	map: CompleteMapping<TMapped>
): React.MemoExoticComponent<
	React.ForwardRefExoticComponent<
		React.PropsWithoutRef<WithSignalProps<JSX.IntrinsicElements[T], TMapped>> &
			React.RefAttributes<RefType<T>>
	>
> {
	const result = memo(
		forwardRef(function Signalled(
			props: WithSignalProps<JSX.IntrinsicElements[T], TMapped>,
			ref: React.ForwardedRef<RefType<T>>
		) {
			const subscriptionRef = useRef<
				Record<string, [Atom<unknown>, Unsubscribe]>
			>({});
			const finalRef = useCombinedRefs(ref);
			const store = useStore();
			const newProps = toPropsObj(store.get, props);

			useEffect(() => {
				return () => {
					subscriptionRef.current = {};
				};
			}, []);

			useEffect(() => {
				const elem = finalRef.current;
				if (!elem) return;
				const signalEntries = toSignalEntries<T, TMapped>(props);
				// unsubscribe from old signals
				difference(
					Object.keys(subscriptionRef.current),
					signalEntries.map((s) => s[0])
				).forEach((key) => {
					subscriptionRef.current[key][1]();
					delete subscriptionRef.current[key];
				});

				// compare new signals against previous
				signalEntries.forEach(([key, value]) => {
					// Check to see if the signal did not change
					if (
						subscriptionRef.current[key] &&
						subscriptionRef.current[key][0] === value
					)
						return;

					// It changed, so unsubscribe the old
					if (subscriptionRef.current[key]) subscriptionRef.current[key][1]();
					// And subscribe the new
					subscriptionRef.current[key] = [
						value,
						setupSetter(map, elem, store, key, value),
					];
				});
			}, [props, finalRef, store]);

			useEffect(() => {
				const subscriptions = subscriptionRef.current;
				return () => {
					Object.values(subscriptions).forEach(([, unsub]) => unsub());
				};
			}, []);

			return createElement(elem, { ...newProps, ref: finalRef });
		})
	);
	result.displayName = `${elem}WithProps`;
	return result;
}
