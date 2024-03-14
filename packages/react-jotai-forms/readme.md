# @principlestudios/react-jotai-forms

_A flexible TypeScript-friendly forms library using React and Jotai_

Additional dependencies currently include:

- zod
- react-i18next (recommended)

## Why another forms library?

Forms on the web are deceptively difficult. Developers need to balance
usability, accessibility, validation, APIs, and even custom fields, making each
form a unique challenge, even within a single web application. Existing form
libraries for React help significantly, but are laden with years of difficult
API decisions.

Some of the primary goals of this library include:

- _Support sub-forms._ For instance, a check-out of a shopping cart may have
  two different address fields; we want a TypeScript-friendly `AddressField`
  component to be able to be created.
- _Translatable validation._ Form validation is tricky enough without the
  challenge of changing error messages within the validation schema; we want
  to provide developer-readable error codes for each field to be translated just
  before displaying to the end user.
- _Support both uncontrolled and controlled components._ Jotai provides an
  excellent library for storing state that does not force React re-renders; this
  allows our forms to both be correct and efficient.
- _Mapping from API structure to form structure._ Even when the APIs are
  designed with front-end developers in mind, there are many situations where
  the React component needs a different structure (especially for reuse).

## Basic example

```typescript
const myFormSchema = z.object({ name: z.string() });

type FormDemoProps = {
	onSubmit: (data: MyForm) => void;
};

export function FormDemo({ onSubmit }: FormDemoProps) {
	const form = useForm({
		schema: myFormSchema,
		defaultValue,
		fields: {
			name: ['name'],
		},
	});

	return (
		<form className="w-full h-full" onSubmit={form.handleSubmit(onSubmit)}>
			<JotaiInput {...form.fields.name.htmlProps()} />
			<button type="submit">{t('submit')}</button>
		</form>
	);
}
```

## What won't this do?

To set some boundaries, there's a number of things this library will not
support:

- _Form presentation._ Every application is unique; styled components will not
  be provided.
- _Form layout._ Because this library receives definitions for final object
  structures rather than user-driven structures, form layout cannot be
  determined.
- _User-presentable error messages._ This library will provide
  developer-readable error codes that can run through a translation library for
  user presentation.
