import { atom, getDefaultStore } from 'jotai';
import { render } from '@testing-library/react';
import { withSignal } from './withSignal';
import { mapAttribute, mapProperty } from './withSignal.mappings';

describe('withSignal', () => {
	describe('without mappings', () => {
		const BasicDiv = withSignal('div');
		const store = getDefaultStore();
		const atomA = atom('100px');

		beforeEach(() => {
			store.set(atomA, '100px');
		});

		it('assigns props normally', () => {
			const { container } = render(
				<BasicDiv className="foobar" style={{ width: 100 }} id="this" />
			);
			const div: HTMLDivElement = container.firstChild as HTMLDivElement;

			expect(div.className).toBe('foobar');
			expect(div.id).toBe('this');
			expect(div.style.width).toBe('100px');
		});

		it('initializes style with value from signal', () => {
			store.set(atomA, '100px');
			const { container } = render(
				<BasicDiv className="foobar" style={{ width: atomA }} id="this" />
			);
			const div: HTMLDivElement = container.firstChild as HTMLDivElement;

			expect(div.className).toBe('foobar');
			expect(div.id).toBe('this');
			expect(div.style.width).toBe('100px');
		});

		it('updates style with value from signal', () => {
			store.set(atomA, '100px');
			const { container } = render(
				<BasicDiv className="foobar" style={{ width: atomA }} id="this" />
			);
			const div: HTMLDivElement = container.firstChild as HTMLDivElement;

			store.set(atomA, '200px');

			expect(div.style.width).toBe('200px');
		});
	});

	describe('with className mapping on a div', () => {
		const BasicDiv = withSignal('div', {
			className: mapProperty('className'),
		});
		const store = getDefaultStore();
		const atomClass = atom('foobar');

		beforeEach(() => {
			store.set(atomClass, 'foobar');
		});

		it('assigns props normally', () => {
			const { container } = render(<BasicDiv className="foobar" />);
			const div: HTMLDivElement = container.firstChild as HTMLDivElement;

			expect(div.className).toBe('foobar');
		});

		it('initializes mapped property with value from signal', () => {
			const { container } = render(<BasicDiv className={atomClass} />);
			const div: HTMLDivElement = container.firstChild as HTMLDivElement;

			expect(div.className).toBe('foobar');
		});

		it('updates mapped property with value from signal', () => {
			const { container } = render(<BasicDiv className={atomClass} />);
			const div: HTMLDivElement = container.firstChild as HTMLDivElement;

			store.set(atomClass, 'baz');

			expect(div.className).toBe('baz');
		});
	});

	describe('with tabIndex mapping on a input', () => {
		const BasicInput = withSignal('input', {
			tabIndex: mapAttribute('tabindex'),
		});
		const store = getDefaultStore();
		const atomTabIndex = atom(15);
		const atomTabIndexString = atom((get): string | undefined =>
			get(atomTabIndex).toFixed(0)
		);

		beforeEach(() => {
			store.set(atomTabIndex, 15);
		});

		it('assigns props normally', () => {
			const { container } = render(<BasicInput tabIndex={15} />);
			const el: HTMLInputElement = container.firstChild as HTMLInputElement;

			expect(el.getAttribute('tabindex')).toBe('15');
		});

		it('initializes mapped property with value from signal', () => {
			const { container } = render(
				<BasicInput tabIndex={atomTabIndexString} />
			);
			const el: HTMLInputElement = container.firstChild as HTMLInputElement;

			expect(el.getAttribute('tabindex')).toBe('15');
		});

		it('updates mapped property with value from signal', () => {
			const { container } = render(
				<BasicInput tabIndex={atomTabIndexString} />
			);
			const el: HTMLInputElement = container.firstChild as HTMLInputElement;

			store.set(atomTabIndex, 30);

			expect(el.getAttribute('tabindex')).toBe('30');
		});
	});

	describe('with tabIndex custom mapping on an input to allow numbers', () => {
		const BasicInput = withSignal('input', {
			tabIndex: (elem) => (value: number | undefined) =>
				value === undefined
					? elem.removeAttribute('tabIndex')
					: elem.setAttribute('tabindex', value.toFixed(0)),
		});
		const store = getDefaultStore();
		const atomTabIndex = atom(15);

		beforeEach(() => {
			store.set(atomTabIndex, 15);
		});

		it('assigns props normally', () => {
			const { container } = render(<BasicInput tabIndex={15} />);
			const el: HTMLInputElement = container.firstChild as HTMLInputElement;

			expect(el.getAttribute('tabindex')).toBe('15');
		});

		it('initializes mapped property with value from signal', () => {
			const { container } = render(<BasicInput tabIndex={atomTabIndex} />);
			const el: HTMLInputElement = container.firstChild as HTMLInputElement;

			expect(el.getAttribute('tabindex')).toBe('15');
		});

		it('updates mapped property with value from signal', () => {
			const { container } = render(<BasicInput tabIndex={atomTabIndex} />);
			const el: HTMLInputElement = container.firstChild as HTMLInputElement;

			store.set(atomTabIndex, 30);

			expect(el.getAttribute('tabindex')).toBe('30');
		});
	});

	describe('with tabIndex via property on an anchor tag', () => {
		const AnimatedA = withSignal('a', {
			tabIndex: mapProperty('tabIndex'),
		});
		const store = getDefaultStore();
		const atomTabIndex = atom(15);

		beforeEach(() => {
			store.set(atomTabIndex, 15);
		});

		it('assigns props normally', () => {
			const { container } = render(<AnimatedA tabIndex={15} />);
			const el: HTMLInputElement = container.firstChild as HTMLInputElement;

			expect(el.tabIndex).toBe(15);
		});

		it('initializes mapped property with value from signal', () => {
			const { container } = render(<AnimatedA tabIndex={atomTabIndex} />);
			const el: HTMLInputElement = container.firstChild as HTMLInputElement;

			expect(el.tabIndex).toBe(15);
		});

		it('updates mapped property with value from signal', () => {
			const { container } = render(<AnimatedA tabIndex={atomTabIndex} />);
			const el: HTMLInputElement = container.firstChild as HTMLInputElement;

			store.set(atomTabIndex, 30);

			expect(el.tabIndex).toBe(30);
		});
	});

	describe('with value via property on an input element', () => {
		const SignalledInput = withSignal('input', {
			value: mapProperty('value'),
		});
		const store = getDefaultStore();
		const atomValue = atom('foo');
		function noop() {
			// avoids console logs about having no onChange event
			// noop is short for "no operation"
		}

		beforeEach(() => {
			store.set(atomValue, 'foo');
		});

		it('assigns props normally', () => {
			const { container } = render(
				<SignalledInput value={'15'} onChange={noop} />
			);
			const el: HTMLInputElement = container.firstChild as HTMLInputElement;

			expect(el.value).toBe('15');
		});

		it('initializes mapped property with value from signal', () => {
			const { container } = render(
				<SignalledInput value={atomValue} onChange={noop} />
			);
			const el: HTMLInputElement = container.firstChild as HTMLInputElement;

			expect(el.value).toBe('foo');
		});

		it('updates mapped property with value from signal', () => {
			const { container } = render(
				<SignalledInput value={atomValue} onChange={noop} />
			);
			const el: HTMLInputElement = container.firstChild as HTMLInputElement;

			store.set(atomValue, 'foobar');

			expect(el.value).toBe('foobar');
		});
	});

	describe('with defaultValue on an input element', () => {
		const SignalledInput = withSignal('input', {
			defaultValue: mapProperty('value'),
		});
		const store = getDefaultStore();
		const atomValue = atom('foo');

		beforeEach(() => {
			store.set(atomValue, 'foo');
		});

		it('assigns props normally', () => {
			const { container } = render(<SignalledInput defaultValue="15" />);
			const el: HTMLInputElement = container.firstChild as HTMLInputElement;

			expect(el.value).toBe('15');
		});

		it('initializes mapped property with value from signal', () => {
			const { container } = render(<SignalledInput defaultValue={atomValue} />);
			const el: HTMLInputElement = container.firstChild as HTMLInputElement;

			expect(el.value).toBe('foo');
		});

		it('updates mapped property with value from signal', () => {
			const { container } = render(<SignalledInput defaultValue={atomValue} />);
			const el: HTMLInputElement = container.firstChild as HTMLInputElement;

			store.set(atomValue, 'foobar');

			expect(el.value).toBe('foobar');
		});
	});

	describe('with a ref', () => {
		const BasicInput = withSignal('input');

		it('allows access to the underlying element', () => {
			const callback = jest.fn();
			const { container } = render(<BasicInput ref={callback} />);

			const el: HTMLInputElement = container.firstChild as HTMLInputElement;
			expect(callback).toBeCalledWith(el);
		});

		it('unmounts correctly', () => {
			const callback = jest.fn();
			const { unmount } = render(<BasicInput ref={callback} />);
			unmount();

			expect(callback).toBeCalledWith(null);
		});
	});
});
