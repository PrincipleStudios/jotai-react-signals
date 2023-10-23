export type AnyIntrinsicElementTag = keyof JSX.IntrinsicElements;
export type AnyIntrinsicElement = JSX.IntrinsicElements[AnyIntrinsicElementTag];
export type RefType<TTag extends AnyIntrinsicElementTag> =
	JSX.IntrinsicElements[TTag]['ref'] extends
		| React.LegacyRef<infer T>
		| undefined
		? T
		: never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Mapping = Record<string, any>;

export type CompleteMapping<TElem extends Element, TMapping extends Mapping> = {
	[K in keyof TMapping]: (elem: TElem) => (value: TMapping[K]) => void;
};

export type PartialMapping<
	TElem extends Element = Element,
	TMapping extends Mapping = Mapping,
> = Partial<CompleteMapping<TElem, TMapping>>;

export function mapProperty<TElem extends Element, TProp extends keyof TElem>(
	propName: TProp
) {
	return (elem: TElem) => (value: TElem[TProp]) => (elem[propName] = value);
}
export function mapAttribute<
	TElem extends Element,
	TAttr extends Parameters<TElem['setAttribute']>[0],
>(attrName: TAttr) {
	return (elem: TElem) => (value: string | null | undefined) =>
		value === null || value === undefined
			? elem.removeAttribute(attrName)
			: elem.setAttribute(attrName, value);
}
const capital = /[A-Z]/g;
function toKebab(styleName: string) {
	const result = styleName.replaceAll(capital, (s) => `-${s}`.toLowerCase());
	if (capital.exec(styleName[0])) {
		return `-${result}`;
	}
	return result;
}
export function mapStyle<
	TElem extends ElementCSSInlineStyle,
	TStyle extends Parameters<TElem['style']['setProperty']>[0],
>(styleName: TStyle) {
	const actualStyleName = toKebab(styleName);
	return (elem: TElem) => (value: unknown) =>
		elem.style.setProperty(actualStyleName, value as string | null);
}
