import { z } from 'zod';
import { useForm } from './useForm';
import JotaiInput from '@principlestudios/react-jotai-form-components/input';
import { UseFormResult } from './types';
import { RenderResult, fireEvent, render } from '@testing-library/react';
import { fastWaitFor } from './test/fastWaitFor';

const myFormSchema = z.object({
	name: z.string(),
});

type MyForm = z.infer<typeof myFormSchema>;
const defaultValue: MyForm = {
	name: '',
};

describe('useForm, inlineFields', () => {
	function translation(key: string) {
		return `translate: ${key}`;
	}

	let useFormResult: UseFormResult<{
		name: string;
	}>;
	let submitSpy: jest.Mock<void, [MyForm]>;
	let rendered: RenderResult;
	let renderCount = 0;

	function MyFormComponent({ onSubmit }: { onSubmit: (data: MyForm) => void }) {
		const form = useForm({
			schema: myFormSchema,
			defaultValue,
			translation,
		});
		useFormResult = form;
		renderCount++;

		return (
			<form
				onSubmit={form.handleSubmit((v) => {
					onSubmit(v);
				})}
			>
				<JotaiInput {...form.field(['name']).htmlProps()} />
				<button type="submit">Submit</button>
			</form>
		);
	}

	beforeEach(() => {
		renderCount = 0;
		submitSpy = jest.fn();
		rendered = render(<MyFormComponent onSubmit={submitSpy} />);
	});

	it('initializes the form to its defaults', () => {
		expect(useFormResult.get()).toBe(defaultValue);
		expect(renderCount).toBe(1);
	});

	it('can submit the default values', async () => {
		const submitButton = rendered.queryByRole('button')!;
		fireEvent.click(submitButton);

		await fastWaitFor(() => expect(submitSpy).toBeCalled());
		expect(submitSpy).toBeCalledWith<[MyForm]>(defaultValue);
	});

	describe('when the user updates the field', () => {
		beforeEach(() => {
			const target = rendered.queryByRole('textbox')!;
			fireEvent.change(target, { target: { value: 'foobar' } });
		});

		it('receives form updates', () => {
			expect(useFormResult.get().name).toBe('foobar');
		});

		it('does not rerender', () => {
			expect(renderCount).toBe(1);
		});

		it('can submit the new value', async () => {
			const submitButton = rendered.queryByRole('button')!;
			fireEvent.click(submitButton);

			await fastWaitFor(() => expect(submitSpy).toBeCalled());
			expect(submitSpy).toBeCalledWith<[MyForm]>({
				name: 'foobar',
			});
		});
	});

	describe('when updated via the form result', () => {
		beforeEach(() => {
			useFormResult.set({ name: 'foobar' });
		});

		it('updates the input', () => {
			const target = rendered.queryByRole('textbox')!;
			expect(target).toHaveProperty('value', 'foobar');
		});

		it('does not rerender', () => {
			expect(renderCount).toBe(1);
		});

		it('can submit the new value', async () => {
			const submitButton = rendered.queryByRole('button')!;
			fireEvent.click(submitButton);

			await fastWaitFor(() => expect(submitSpy).toBeCalled());
			expect(submitSpy).toBeCalledWith<[MyForm]>({
				name: 'foobar',
			});
		});
	});
});
