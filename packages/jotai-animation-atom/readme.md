# Animation for Jotai Atoms

This provides a simple way to bind Jotai atoms to real-time animations.

Please note that the current state of this package is a proof-of-concept; while it works quite well, there is no live demo and the API may change significantly.

Included in this package:

- Utilities for animation
  - `getAnimationSignal` - given a `get` from a store, will subscribe to animation updates when used within Jotai's `atom()` and return the current performance timer value
  - `getInstantaneousAnimationSignal` - returns the current performance timer value
  - `manuallyUpdateAnimationFrame` - function to manually trigger animationSignal updates when not subscribed (this prety well defeats the purpose of animations...)
  - `tweenedAtom` - tweens an `Atom<number>` via an `EasingFunction` (not provided, but see [tween.js](https://www.npmjs.com/package/@tweenjs/tween.js)'s `Easing` export for examples) using the `animationSignal`
  - `initializeForAnimations` - initializes a store for animations. Happens automatically if a `tweenedAtom` or an animation using `getAnimationSignal` is subscribed to.

Usage example:

```tsx
import { atom } from 'jotai';
import { tweenedAtom, getAnimationSignal } from '@mdekrey/jotai-animation-atom';

const size = atom(15);
const tweenedSize = tweenedAtom(size, Easing.Quadratic.Out);
const customAtom = atom(
	(get) => Math.round(getAnimationSignal(get) / 1000) % 2
);
```

## Troubleshooting

If your animations are not happening and you are not using subscriptions, make sure you call `initializeForAnimations(store)` with the store you are using to get the animation values.
