import { z } from 'zod';
import { useForm } from './useForm';
import JotaiInput from '@principlestudios/react-jotai-form-components/input';
import { FormFieldReturnType, UseFormResult } from './types';
import { RenderResult, fireEvent, render } from '@testing-library/react';
import { fastWaitFor } from './test/fastWaitFor';
import { waitForErrors } from './test/waitForErrors';
import { useFormFields } from './useFormFields';

const myFormSchema = z.object({
	address: z.object({
		street: z.string(),
		city: z.string(),
		state: z.string(),
		zipCode: z.string(),
	}),
});
type MyForm = z.infer<typeof myFormSchema>;
type ComponentProps = { onSubmit: (data: MyForm) => void };

const myFormSchemaWithValidation = z.object({
	address: z.object({
		street: z.string().min(1),
		city: z.string().min(1),
		state: z.string().length(2),
		zipCode: z.string().length(5),
	}),
});

const defaultValue: MyForm = {
	address: {
		street: '',
		city: '',
		state: '',
		zipCode: '',
	},
};

describe('useForm, nested-object', () => {
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
		address,
		onSubmit,
	}: ComponentProps & {
		form: UseFormResult<MyForm>;
		address: FormFieldReturnType<MyForm['address']>;
	}) {
		const { street, city, state, zipCode } = useFormFields(address, {
			street: ['street'],
			city: ['city'],
			state: ['state'],
			zipCode: ['zipCode'],
		});
		return (
			<form
				onSubmit={form.handleSubmit((v) => {
					onSubmit(v);
				})}
			>
				<JotaiInput
					{...street.htmlProps()}
					aria-label={street.translationPath.join('.')}
				/>
				<JotaiInput
					{...city.htmlProps()}
					aria-label={city.translationPath.join('.')}
				/>
				<JotaiInput
					{...state.htmlProps()}
					aria-label={state.translationPath.join('.')}
				/>
				<JotaiInput
					{...zipCode.htmlProps()}
					aria-label={zipCode.translationPath.join('.')}
				/>
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
				fields: {
					address: ['address'],
				},
			});
			useFormResult = form;
			renderCount++;

			return (
				<FormPresentation
					address={form.fields.address}
					form={form}
					onSubmit={onSubmit}
				/>
			);
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

	describe('with invalid paths', () => {
		function MyFormComponent({ onSubmit }: ComponentProps) {
			// @ts-expect-error the correct path is 'address', not 'billingAddress'
			const form = useForm({
				schema: myFormSchemaWithValidation,
				defaultValue,
				translation,
				fields: {
					address: ['billingAddress'],
				},
			});
			useFormResult = form;
			renderCount++;

			return (
				<FormPresentation
					// @ts-expect-error the form library might not allow access of "fields"
					address={form.fields.address}
					form={form}
					onSubmit={onSubmit}
				/>
			);
		}

		// The following tests intentionally output warnings
		let warn: jest.SpyInstance;
		beforeEach(() => {
			warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
			rendered = render(<MyFormComponent onSubmit={submitSpy} />);
		});
		afterEach(() => {
			warn.mockReset();
		});

		it('renders gracefully', () => {
			expect(useFormResult.get()).toBe(defaultValue);
			expect(renderCount).toBe(1);
		});
	});

	describe('with validation', () => {
		function MyFormComponent({ onSubmit }: ComponentProps) {
			const form = useForm({
				schema: myFormSchemaWithValidation,
				defaultValue,
				translation,
				fields: {
					address: ['address'],
				},
			});
			useFormResult = form;
			renderCount++;

			return (
				<FormPresentation
					address={form.fields.address}
					form={form}
					onSubmit={onSubmit}
				/>
			);
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
			const target = rendered.getByLabelText('address.street');
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
			const targetError = loadedErrors.issues.find(
				(e) => e.path[1] === 'zipCode'
			);
			expect(targetError).not.toBe(undefined);
			expect(targetError?.code).toStrictEqual('too_small');
			expect(targetError?.path).toStrictEqual(['address', 'zipCode']);
		});

		it('updates messages after submit on blur', async () => {
			const submitButton = rendered.queryByRole('button', {
				name: 'Submit',
			})!;
			fireEvent.click(submitButton);
			// error message at this time is too_small

			const target = rendered.getByLabelText('address.zipCode');
			fireEvent.change(target, { target: { value: 'this value is too long' } });
			fireEvent.blur(target);

			const loadedErrors = (await waitForErrors(useFormResult.errors))!;
			expect(
				loadedErrors.issues.find((e) => e.path[1] === 'zipCode')?.code
			).toStrictEqual('too_big');
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
				const target = rendered.getByLabelText('address.street');
				fireEvent.change(target, { target: { value: 'foobar' } });
			});

			it('receives form updates', () => {
				expect(useFormResult.get()).toStrictEqual({
					address: { city: '', state: '', street: 'foobar', zipCode: '' },
				});
			});

			it('does not rerender', () => {
				expect(renderCount).toBe(1);
			});

			it('can submit the new value', async () => {
				fireEvent.change(rendered.getByLabelText('address.city'), {
					target: { value: 'Richardson' },
				});
				fireEvent.change(rendered.getByLabelText('address.state'), {
					target: { value: 'TX' },
				});
				fireEvent.change(rendered.getByLabelText('address.zipCode'), {
					target: { value: '75081' },
				});

				const submitButton = rendered.queryByRole('button', {
					name: 'Submit',
				})!;
				fireEvent.click(submitButton);

				await fastWaitFor(() => expect(submitSpy).toBeCalled());
				expect(submitSpy).toBeCalledWith<[MyForm]>({
					address: {
						city: 'Richardson',
						state: 'TX',
						street: 'foobar',
						zipCode: '75081',
					},
				});
			});
		});

		describe('when updated via the form result', () => {
			beforeEach(() => {
				useFormResult.set({
					address: {
						city: 'Richardson',
						state: 'TX',
						street: '123 W Main St',
						zipCode: '75081',
					},
				});
			});

			it('updates the input', () => {
				const target = rendered.getByLabelText('address.street');
				expect(target).toHaveProperty('value', '123 W Main St');
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
				expect(submitSpy).toBeCalledWith<[MyForm]>({
					address: {
						city: 'Richardson',
						state: 'TX',
						street: '123 W Main St',
						zipCode: '75081',
					},
				});
			});
		});
	}
});
