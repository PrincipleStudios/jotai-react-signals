import { z } from 'zod';
import { useForm } from './useForm';
import JotaiInput from '@principlestudios/react-jotai-form-components/input';
import { UseFormResultWithFields } from './types';
import {
	RenderResult,
	fireEvent,
	render,
	renderHook,
} from '@testing-library/react';
import { fastWaitFor } from './test/fastWaitFor';
import { waitForErrors } from './test/waitForErrors';

const myFormSchema = z.object({
	name: z.string(),
});
type MyForm = z.infer<typeof myFormSchema>;
type ComponentProps = { onSubmit: (data: MyForm) => void };

const nameSchema = z.string().min(3).max(10);

const defaultValue: MyForm = {
	name: '',
};

describe('useForm, specifiedFields', () => {
	function translation(key: string) {
		return `translate: ${key}`;
	}

	let useFormResult: UseFormResultWithFields<
		MyForm,
		{
			readonly name: readonly ['name'];
		}
	>;
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
	}: ComponentProps & {
		form: UseFormResultWithFields<
			MyForm,
			{
				readonly name: readonly ['name'];
			}
		>;
	}) {
		return (
			<form
				onSubmit={form.handleSubmit((v) => {
					onSubmit(v);
				})}
			>
				<JotaiInput {...form.fields.name.htmlProps()} />
				<button type="submit">Submit</button>
			</form>
		);
	}

	it('overrides schema for the field', () => {
		const formHookResult = renderHook(() =>
			useForm({
				schema: myFormSchema,
				defaultValue,
				translation,
				fields: {
					name: { path: ['name'], schema: nameSchema },
				},
			})
		);
		const form = formHookResult.result.current;
		expect(form.fields.name).not.toBe(undefined);
		expect(form.fields.name.schema).toBe(nameSchema);
	});

	describe('with no field schema', () => {
		function MyFormComponent({ onSubmit }: ComponentProps) {
			const form = useForm({
				schema: myFormSchema,
				defaultValue,
				translation,
				fields: {
					name: ['name'],
				},
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
			const submitButton = rendered.queryByRole('button')!;
			fireEvent.click(submitButton);

			await fastWaitFor(() => expect(submitSpy).toBeCalled());
			expect(submitSpy).toBeCalledWith<[MyForm]>(defaultValue);
		});

		standardUpdateAndSubmitTests();
	});

	describe('with validation only on field', () => {
		function MyFormComponent({ onSubmit }: ComponentProps) {
			const form = useForm({
				schema: myFormSchema,
				defaultValue,
				translation,
				fields: {
					name: { path: ['name'], schema: nameSchema },
				},
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
			const submitButton = rendered.queryByRole('button')!;
			fireEvent.click(submitButton);

			const loadedErrors = (await waitForErrors(
				useFormResult.fields.name.errors
			))!;
			expect(loadedErrors.issues[0].code).toBe('too_small');
			expect(loadedErrors.issues[0].path).toStrictEqual(['name']);
		});

		it('updates messages after submit on blur', async () => {
			const submitButton = rendered.queryByRole('button')!;
			fireEvent.click(submitButton);
			// error message at this time is too_small

			const target = rendered.queryByRole('textbox')!;
			fireEvent.change(target, { target: { value: 'this value is too long' } });
			fireEvent.blur(target);

			const loadedErrors = (await waitForErrors(
				useFormResult.fields.name.errors
			))!;
			expect(loadedErrors.issues[0].code).toBe('too_big');
		});

		it('can submit the default values because validation is not on the root schema', async () => {
			const submitButton = rendered.queryByRole('button')!;
			fireEvent.click(submitButton);

			const loadedErrors = await waitForErrors(useFormResult.errors);
			expect(loadedErrors).toBeNull();
			expect(submitSpy).toBeCalled();
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
	}
});
