import { z } from 'zod';
import { useForm } from './useForm';
import JotaiInput from '@principlestudios/react-jotai-form-components/input';
import { UseFormResult } from './types';
import { RenderResult, fireEvent, render } from '@testing-library/react';

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

	function MyFormComponent({ onSubmit }: { onSubmit: (data: MyForm) => void }) {
		const form = useForm({
			schema: myFormSchema,
			defaultValue,
			translation,
		});
		useFormResult = form;

		return (
			<form className="w-full h-full" onSubmit={form.handleSubmit(onSubmit)}>
				<JotaiInput {...form.field(['name']).htmlProps()} />
				<button type="submit">Submit</button>
			</form>
		);
	}

	beforeEach(() => {
		submitSpy = jest.fn();
		rendered = render(<MyFormComponent onSubmit={submitSpy} />);
	});

	it('initializes the form to its defaults', () => {
		expect(useFormResult.get()).toBe(defaultValue);
	});

	it('receives form updates', () => {
		const target = rendered.queryByRole('textbox')!;
		console.log(target);
		fireEvent.change(target, { target: { value: 'foobar' } });
		expect(useFormResult.get().name).toBe('foobar');
	});
});
