# Jotai Utilities

Includes common utilities not found in core Jotai but used by several other of our libraries. Built using imports on a per-utility basis for automatic tree-shaking.

## `isAtom`

Determines if a provided value is a Jotai `atom` or any other value.

Example:

```ts
import { type Atom, getDefaultStore } from 'jotai';
import { isAtom } from '@principlestudios/jotai-utilities/isAtom';

function currentValue<T>(someValue: Atom<T> | T): T {
	if (isAtom(someValue)) return getDefaultStore().get(someValue);
	return someValue;
}
```

## `currentValue`

Returns the value of the Atom provided or, if the value was not an atom, the value provided.

Example:

```ts
import { atom, type Atom } from 'jotai';
import { currentValue } from '@principlestudios/jotai-utilities/currentValue';

function getRange(
	min: Atom<number> | number,
	max: Atom<number> | number
): number {
	return currentValue(max) - currentValue(min);
}

function getRangeAtom(
	min: Atom<number> | number,
	max: Atom<number> | number
): Atom<number> {
	return atom((get) => currentValue(max, get) - currentValue(min, get));
}
```
