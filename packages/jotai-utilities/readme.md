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
