import { atom, getDefaultStore } from 'jotai';
import { render } from '@testing-library/react';
import { withSignal } from './withSignal';
import { mapAttribute, mapProperty } from './withSignal.mappings';

describe('withSignal', () => {
	describe('without mappings', () => {
		const BasicDiv = withSignal('div', {});
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
		const atomRadius = atom(15);

		beforeEach(() => {
			store.set(atomRadius, 15);
		});

		it('assigns props normally', () => {
			const { container } = render(<BasicInput tabIndex={15} />);
			const el: HTMLInputElement = container.firstChild as HTMLInputElement;

			expect(el.getAttribute('tabindex')).toBe('15');
		});

		it('initializes mapped property with value from signal', () => {
			const { container } = render(<BasicInput tabIndex={atomRadius} />);
			const el: HTMLInputElement = container.firstChild as HTMLInputElement;

			expect(el.getAttribute('tabindex')).toBe('15');
		});

		it('updates mapped property with value from signal', () => {
			const { container } = render(<BasicInput tabIndex={atomRadius} />);
			const el: HTMLInputElement = container.firstChild as HTMLInputElement;

			store.set(atomRadius, 30);

			expect(el.getAttribute('tabindex')).toBe('30');
		});
	});
});