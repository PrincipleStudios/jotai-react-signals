# React Signals with Jotai

This provides a simple way to bind Jotai atoms to React intrinsic elements to get reactive pages, like the signals paradigm.

Please note that the current state of this package is a proof-of-concept; while it works quite well, there is no live demo and the API may change significantly.

Included in this package:

- Hooks for more easily working with computed Jotai state
  - `useComputedAtom` - same interface as Jotai's `computed`, but as a React hook with no dependencies
  - `useAsAtom` - converts a `T | Atom<T>` to an `Atom<T>` as a React hook, so your APIs can be flexible.
- Utilities for animation
  - `animationSignal` - provides updates per `requestAnimationFrame` (must subscribe to the `animationSignal` or call `manuallyUpdateAnimationFrame`)
  - `manuallyUpdateAnimationFrame` - function to manually trigger animationSignal updates when not subscribed (this prety well defeats the purpose of animations...)
  - `tweenedSignal` - tweens an `Atom<number>` via an `EasingFunction` (not provided, but see [tween.js](https://www.npmjs.com/package/@tweenjs/tween.js)'s `Easing` export for examples) using the `animationSignal`
- Utilities for binding to elements
  - `withSignal` - takes the name of a React intrinsic element and a mapping of React props to functions to update the element to create a new component that will update your element in real-time.
  - `mapProperty` - helper function for mapping a value to an element property
  - `mapAttribute` - helper function for mapping a value to an element attribute

Usage example, as a Storybook entry:

```tsx
import { Story, Meta } from '@storybook/react';
import { useMemo } from 'react';
import { useStore } from 'jotai';
import {
	tweenedSignal,
	useComputedAtom,
	mapAttribute,
	type PartialMapping,
	withSignal,
	useAsAtom,
} from '@mdekrey/jotai-react-signals';
import { Easing } from '@tweenjs/tween.js';

const sampleMapping = {
	cx: mapAttribute('cx'),
	cy: mapAttribute('cy'),
	r: mapAttribute('r'),
	strokeWidth: mapAttribute('stroke-width'),
} satisfies PartialMapping;

const AnimatedCircle = withSignal('circle', sampleMapping);

type Props = {
	size: number;
};

export default {
	title: 'Example/Jotai Signals',
	argTypes: {
		size: {
			control: {
				type: 'number',
			},
		},
	},
	parameters: {},
} as Meta<Props>;

const Template: Story<Props> = (args) => {
	const store = useStore();
	const size$ = useAsAtom(args.size);
	const tweenedSize$ = useMemo(
		() => tweenedSignal(store, size$, Easing.Quadratic.Out),
		[store, size$]
	);
	const strokeWidth$ = useComputedAtom((get) => get(tweenedSize$) / 15);
	return (
		<svg width="300px" height="300px">
			<AnimatedCircle
				cx={150}
				cy={150}
				r={atom((get) => get(tweenedSize$).toFixed(3))}
				strokeWidth={atom((get) => get(strokeWidth$).toFixed(3))}
				stroke="red"
				fill="none"
			/>
		</svg>
	);
};

export const Primary = Template.bind({});
Primary.args = {
	size: 30,
};
```
