import { render } from '@testing-library/react';
import { Atom } from 'jotai';
import { atom, getDefaultStore } from 'jotai';

type AtomType<T> = Extract<T, Atom<unknown>> extends Atom<infer TResult>
	? TResult
	: never;

type ComponentAtomFieldType<
	TComponent extends React.ComponentType,
	TField extends keyof React.ComponentProps<TComponent>,
> = AtomType<React.ComponentProps<TComponent>[TField]>;

type RefFieldType<TFieldType> = Extract<
	TFieldType,
	React.Ref<unknown>
> extends React.Ref<infer TResult>
	? TResult
	: never;

type RefElemType<TComponent extends React.ComponentType> =
	'ref' extends keyof React.ComponentProps<TComponent>
		? RefFieldType<React.ComponentProps<TComponent>['ref']>
		: never;

export function testAtomField<
	TComponent extends React.ComponentType,
	TField extends keyof React.ComponentProps<TComponent>,
>(
	component: TComponent,
	field: TField,
	initialValue: ComponentAtomFieldType<TComponent, TField>,
	newValue: ComponentAtomFieldType<TComponent, TField>,
	getter: (
		elem: RefElemType<TComponent>
	) => ComponentAtomFieldType<TComponent, TField>
): void;
export function testAtomField<TKey extends string, TValue>(
	ComponentType: React.ComponentType<{ [K in TKey]?: TValue }>,
	field: TKey,
	initialValue: TValue,
	newValue: TValue,
	getter: (elem: ChildNode | null) => TValue
) {
	const store = getDefaultStore();
	const atomValue = atom(initialValue);

	describe(`has an atom-field called ${field}`, () => {
		beforeEach(() => {
			store.set(atomValue, initialValue);
		});

		it('assigns props normally', () => {
			const { container } = render(
				<ComponentType {...{ [field]: initialValue }} />
			);
			const el = container.firstChild;

			expect(getter(el)).toBe(initialValue);
		});

		it('initializes mapped property with value from signal', () => {
			const { container } = render(
				<ComponentType {...{ [field]: atomValue }} />
			);
			const el = container.firstChild;

			expect(getter(el)).toBe(initialValue);
		});

		it('updates mapped property with value from signal', async () => {
			const { container } = render(
				<ComponentType {...{ [field]: atomValue }} />
			);
			const el = container.firstChild;

			store.set(atomValue, newValue);

			expect(getter(el)).toBe(newValue);
		});
	});
}
