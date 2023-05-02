export type AnyIntrinsicElementTag = keyof JSX.IntrinsicElements;
export type AnyIntrinsicElement = JSX.IntrinsicElements[AnyIntrinsicElementTag];
export type RefType<TTag extends AnyIntrinsicElementTag> =
	JSX.IntrinsicElements[TTag]['ref'] extends
		| React.LegacyRef<infer T>
		| undefined
		? T
		: never;
type KeysOfUnion<T> = T extends T ? keyof T : never;
type IntrinsicProps = KeysOfUnion<AnyIntrinsicElement>;
export type MappingKeys = IntrinsicProps;

export type CompleteMapping<T extends MappingKeys> = Record<
	T,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(elem: Element) => (value: any) => void
>;

export type PartialMapping = Partial<CompleteMapping<MappingKeys>>;

export function mapProperty<TElem extends Element, TProp extends keyof TElem>(
	propName: TProp
) {
	return (elem: TElem) => (value: TElem[TProp]) => (elem[propName] = value);
}
export function mapAttribute<
	TElem extends Element,
	TAttr extends Parameters<TElem['setAttribute']>[0]
>(attrName: TAttr) {
	return (elem: TElem) => (value: string | null) =>
		value === null
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
	TStyle extends Parameters<TElem['style']['setProperty']>[0]
>(styleName: TStyle) {
	const actualStyleName = toKebab(styleName);
	return (elem: TElem) => (value: unknown) =>
		elem.style.setProperty(actualStyleName, value as string | null);
}
