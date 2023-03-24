import type { Atom, Getter } from 'jotai';
import {
	createElement,
	CSSProperties,
	forwardRef,
	useRef,
	useEffect,
	memo,
} from 'react';
import { useSignalStore, SignalStore } from './context';
import { isSignal } from './utils';
import {
	styles,
	isStyleKey,
	properties,
	isPropertyKey,
	attributes,
	isAttributeKey,
	type AnyIntrinsicElementTag,
	type AnyIntrinsicElement,
} from './withSignal.mappings';

function difference<T>(arr1: T[], arr2: T[]) {
	return arr1.filter((x) => !arr2.includes(x));
}

type MaybeSignal<T> = T | Atom<T>;

type CSSPropertiesWithSignal = {
	[K in keyof CSSProperties | `--${string}`]?: K extends `--${string}`
		? MaybeSignal<string | number>
		: K extends keyof typeof styles
		? MaybeSignal<CSSProperties[K]>
		: K extends keyof CSSProperties
		? CSSProperties[K]
		: never;
};

type WithSignalProps<T extends AnyIntrinsicElement> = {
	[K in keyof T]: K extends 'style'
		? T[K] extends CSSProperties | undefined
			? CSSPropertiesWithSignal | undefined
			: T[K]
		: K extends keyof typeof attributes | keyof typeof properties
		? MaybeSignal<T[K]>
		: T[K];
};

function toPropsObj<T extends { style?: CSSProperties }>(
	get: Getter,
	props: WithSignalProps<T>
): T {
	return Object.fromEntries(
		Object.entries(props).map(([key, value]) => {
			if (isSignal(value)) return [key, get(value as Atom<unknown>)];
			if (key === 'style')
				return [
					'style',
					Object.fromEntries(
						Object.entries(value as CSSPropertiesWithSignal).map(([k, v]) => [
							k,
							isSignal(v) ? get(v) : v,
						])
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
	}, refs);

	return targetRef;
}

function toUpdater(
	elem: Element & ElementCSSInlineStyle,
	key: string
): (value: unknown) => void {
	if (key.startsWith('style.')) {
		const stylePart = key.split('.')[1];
		if (isStyleKey(stylePart)) {
			return (value) =>
				elem.style.setProperty(styles[stylePart], value?.toString() ?? null);
		} else if (stylePart.startsWith('--')) {
			return (value) => {
				return elem.style.setProperty(stylePart, value?.toString() ?? null);
			};
		}
	} else if (isPropertyKey(key)) {
		return (value) => ((elem as any)[properties[key]] = value);
	} else if (isAttributeKey(key)) {
		return (value) =>
			elem.setAttribute(attributes[key], (value ?? '')?.toString());
	}
	console.warn(`unknown key:`, elem, key);
	return () => {};
}

type Unsubscribe = () => void;

function setupSetter(
	elem: Element & ElementCSSInlineStyle,
	store: SignalStore,
	key: string,
	value: Atom<unknown>
): Unsubscribe {
	const applyUpdate = toUpdater(elem, key);
	applyUpdate(store.get(value));
	const unsub = store.sub(value, () => {
		applyUpdate(store.get(value));
	});
	return unsub;
}

type SignalEntry = [key: string, value: Atom<unknown>];
function toSignalEntries<T extends AnyIntrinsicElementTag>(
	target: WithSignalProps<JSX.IntrinsicElements[T]>
): SignalEntry[] {
	return Object.entries(target).flatMap(([key, value]): SignalEntry[] => {
		if (isSignal(value)) return [[key, value]];
		else if (key === 'style')
			return Object.entries(value as Object).flatMap(
				([key, value]): SignalEntry[] => {
					if (isSignal(value)) return [[`style.${key}`, value]];
					return [];
				}
			);
		else return [];
	});
}

export function withSignal<T extends AnyIntrinsicElementTag>(elem: T) {
	const result = memo(
		forwardRef(function Signalled(
			props: WithSignalProps<JSX.IntrinsicElements[T]>,
			ref: React.ForwardedRef<T>
		) {
			const subscriptionRef = useRef<
				Record<string, [Atom<unknown>, Unsubscribe]>
			>({});
			const finalRef = useCombinedRefs(ref);
			const store = useSignalStore();
			const newProps = toPropsObj(store.get, props);

			useEffect(() => {
				return () => {
					subscriptionRef.current = {};
				};
			}, []);

			useEffect(() => {
				const elem = finalRef.current;
				if (!elem) return;
				const signalEntries = toSignalEntries<T>(props);
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
						setupSetter(elem, store, key, value),
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
