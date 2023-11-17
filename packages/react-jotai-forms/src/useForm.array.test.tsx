import { z } from 'zod';
import { useForm } from './useForm';
import JotaiInput from '@principlestudios/react-jotai-form-components/input';
import { UseFormResult } from './types';
import { RenderResult, fireEvent, render } from '@testing-library/react';
import { fastWaitFor } from './test/fastWaitFor';
import { waitForErrors } from './test/waitForErrors';
import { useAtomValue } from 'jotai';
import { useComputedAtom } from '@principlestudios/jotai-react-signals';
import { useCallback } from 'react';

const myFormSchema = z.string().array();
type MyForm = z.infer<typeof myFormSchema>;
type ComponentProps = { onSubmit: (data: MyForm) => void };

const myFormSchemaWithValidation = z
	.string()
	.min(3)
	.max(10)
	.array() satisfies z.ZodSchema<MyForm>;

const defaultValue: MyForm = [''];

describe('useForm, array', () => {
	function translation(key: string) {
		return `translate: ${key}`;
	}

	let useFormResult: UseFormResult<MyForm>;
	let submitSpy: jest.Mock<void, [MyForm]>;
	let rendered: RenderResult;
	let renderCount = 0;

	beforeEach(() => {
		renderCount = 0;
		submitSpy = jest.fn();
	});

	function FormPresentation({
		form,
		onSubmit,
	}: ComponentProps & { form: UseFormResult<MyForm> }) {
		const arrayItemCount = useAtomValue(
			useComputedAtom((get) => get(form.atom).length)
		);
		const addItem = useCallback(
			function addItem() {
				form.set((items) => [...items, '']);
			},
			[defaultValue]
		);

		return (
			<form
				onSubmit={form.handleSubmit((v) => {
					onSubmit(v);
				})}
			>
				{Array(arrayItemCount)
					.fill(0)
					.map((_, index) => (
						<JotaiInput key={index} {...form.field([index]).htmlProps()} />
					))}
				<button onClick={addItem}>Add</button>
				<button type="submit">Submit</button>
			</form>
		);
	}

	describe('with no validation', () => {
		function MyFormComponent({ onSubmit }: ComponentProps) {
			const form = useForm({
				schema: myFormSchema,
				defaultValue,
				translation,
			});
			useFormResult = form;
			renderCount++;

			return <FormPresentation form={form} onSubmit={onSubmit} />;
		}

		beforeEach(() => {
			rendered = render(<MyFormComponent onSubmit={submitSpy} />);
		});

		it('initializes the form to its defaults', () => {
			expect(useFormResult.get()).toBe(defaultValue);
			expect(renderCount).toBe(1);
		});

		it('can submit the default values', async () => {
			const submitButton = rendered.queryByRole('button', {
				name: 'Submit',
			})!;
			fireEvent.click(submitButton);

			await fastWaitFor(() => expect(submitSpy).toBeCalled());
			expect(submitSpy).toBeCalledWith<[MyForm]>(defaultValue);
		});

		standardUpdateAndSubmitTests();
	});

	describe('with validation', () => {
		function MyFormComponent({ onSubmit }: ComponentProps) {
			const form = useForm({
				schema: myFormSchemaWithValidation,
				defaultValue,
				translation,
			});
			useFormResult = form;
			renderCount++;

			return <FormPresentation form={form} onSubmit={onSubmit} />;
		}

		beforeEach(() => {
			rendered = render(<MyFormComponent onSubmit={submitSpy} />);
		});

		it('initializes the form to its defaults', () => {
			expect(useFormResult.get()).toBe(defaultValue);
			expect(renderCount).toBe(1);
		});

		it('does not have error messages initially', async () => {
			const loadedErrors = await waitForErrors(useFormResult.errors);
			expect(loadedErrors).toBeNull();
		});

		it('does not have error messages until submit', async () => {
			const target = rendered.queryByRole('textbox')!;
			fireEvent.change(target, { target: { value: 'no' } });

			const loadedErrors = await waitForErrors(useFormResult.errors);
			expect(loadedErrors).toBeNull();
		});

		it('gets error messages after submit', async () => {
			const submitButton = rendered.queryByRole('button', {
				name: 'Submit',
			})!;
			fireEvent.click(submitButton);

			const loadedErrors = (await waitForErrors(useFormResult.errors))!;
			expect(loadedErrors.issues[0].code).toBe('too_small');
			expect(loadedErrors.issues[0].path).toStrictEqual([0]);
		});

		it('updates messages after submit on blur', async () => {
			const submitButton = rendered.queryByRole('button', {
				name: 'Submit',
			})!;
			fireEvent.click(submitButton);
			// error message at this time is too_small

			const target = rendered.queryByRole('textbox')!;
			fireEvent.change(target, { target: { value: 'this value is too long' } });
			fireEvent.blur(target);

			const loadedErrors = (await waitForErrors(useFormResult.errors))!;
			expect(loadedErrors.issues[0].code).toBe('too_big');
		});

		it('cannot submit the default values', async () => {
			const submitButton = rendered.queryByRole('button', {
				name: 'Submit',
			})!;
			fireEvent.click(submitButton);

			await waitForErrors(useFormResult.errors);
			expect(submitSpy).not.toBeCalled();
		});

		standardUpdateAndSubmitTests();
	});

	function standardUpdateAndSubmitTests() {
		describe('when the user updates the field', () => {
			beforeEach(() => {
				const target = rendered.queryByRole('textbox')!;
				fireEvent.change(target, { target: { value: 'foobar' } });
			});

			it('receives form updates', () => {
				expect(useFormResult.get()).toStrictEqual(['foobar']);
			});

			it('does not rerender', () => {
				expect(renderCount).toBe(1);
			});

			it('can submit the new value', async () => {
				const submitButton = rendered.queryByRole('button', {
					name: 'Submit',
				})!;
				fireEvent.click(submitButton);

				await fastWaitFor(() => expect(submitSpy).toBeCalled());
				expect(submitSpy).toBeCalledWith<[MyForm]>(['foobar']);
			});
		});

		describe('when updated via the form result', () => {
			beforeEach(() => {
				useFormResult.set(['foobar']);
			});

			it('updates the input', () => {
				const target = rendered.queryByRole('textbox')!;
				expect(target).toHaveProperty('value', 'foobar');
			});

			it('does not rerender', () => {
				expect(renderCount).toBe(1);
			});

			it('can submit the new value', async () => {
				const submitButton = rendered.queryByRole('button', {
					name: 'Submit',
				})!;
				fireEvent.click(submitButton);

				await fastWaitFor(() => expect(submitSpy).toBeCalled());
				expect(submitSpy).toBeCalledWith<[MyForm]>(['foobar']);
			});

			it('can add a new value', async () => {
				const addButton = rendered.queryByRole('button', {
					name: 'Add',
				})!;
				fireEvent.click(addButton);

				expect(useFormResult.get()).toStrictEqual(['foobar', '']);
				const target = await rendered.findAllByRole('textbox');
				expect(target.length).toBe(2);
			});

			it('can update the new value as expected', async () => {
				const addButton = rendered.queryByRole('button', {
					name: 'Add',
				})!;
				fireEvent.click(addButton);
				const target = await rendered.findAllByRole('textbox');
				fireEvent.change(target[1], { target: { value: 'bombaz' } });

				expect(useFormResult.get()).toStrictEqual(['foobar', 'bombaz']);
			});
		});

		describe('with an additional entry', () => {
			beforeEach(async () => {
				const addButton = rendered.queryByRole('button', {
					name: 'Add',
				})!;
				fireEvent.click(addButton);
				useFormResult.set(['foobar', 'bombaz']);
			});

			it('updates the input', async () => {
				const target = await rendered.findAllByRole('textbox');
				expect(target[0]).toHaveProperty('value', 'foobar');
				expect(target[1]).toHaveProperty('value', 'bombaz');
			});

			it('can submit the new value', async () => {
				const submitButton = rendered.queryByRole('button', {
					name: 'Submit',
				})!;
				fireEvent.click(submitButton);

				await fastWaitFor(() => expect(submitSpy).toBeCalled());
				expect(submitSpy).toBeCalledWith<[MyForm]>(['foobar', 'bombaz']);
			});
		});
	}
});
