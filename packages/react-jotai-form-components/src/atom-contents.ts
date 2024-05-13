import { createElement, Fragment } from 'react';
import type { Atom } from 'jotai';
import { useAtomValue } from 'jotai';

export function AtomContents({
	children,
}: {
	children: Atom<React.ReactNode>;
}) {
	const value = useAtomValue(children);
	return createElement(Fragment, null, value);
}
