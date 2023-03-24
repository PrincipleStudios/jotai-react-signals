import { type CSSProperties } from 'react';

export type AnyIntrinsicElementTag = keyof JSX.IntrinsicElements;
export type AnyIntrinsicElement = JSX.IntrinsicElements[AnyIntrinsicElementTag];
type KeysOfUnion<T> = T extends T ? keyof T : never;
type IntrinsicProps = KeysOfUnion<AnyIntrinsicElement>;
export const properties = {} satisfies Partial<Record<IntrinsicProps, string>>;
export const attributes = {
	x: 'x',
	y: 'y',
	width: 'width',
	height: 'height',
	transform: 'transform',
	d: 'd',
	strokeWidth: 'stroke-width',
} satisfies Partial<Record<IntrinsicProps, string>>;
export const styles = {} satisfies Partial<Record<keyof CSSProperties, string>>;

export function isPropertyKey(s: string): s is keyof typeof styles {
	return s in properties;
}
export function isAttributeKey(s: string): s is keyof typeof attributes {
	return s in attributes;
}
export function isStyleKey(s: string): s is keyof typeof properties {
	return s in styles;
}
