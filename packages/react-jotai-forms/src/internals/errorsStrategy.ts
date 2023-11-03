import type { IFieldEvents } from '../events/FieldEvents';
import { FieldEvents } from '../events/FieldEvents';
import { FormEvents } from '../events/FormEvents';

export type ErrorsStrategy =
	| 'onChange'
	| 'onBlur'
	| 'onSubmit'
	| 'onTouched'
	| 'all';

export type RegisterErrorStrategy = (
	this: void,
	fieldEvents: IFieldEvents,
	callback: EventListenerOrEventListenerObject
) => void;
export function errorsStrategy(
	preSubmit: ErrorsStrategy,
	postSubmit: ErrorsStrategy,
	formEvents: FormEvents
): RegisterErrorStrategy {
	let hasSubmitted = false;
	formEvents.addEventListener(FormEvents.Submit, () => (hasSubmitted = true));

	const [registerPreSubmit, unregisterPreSubmit] = getErrorStrategy(preSubmit);
	const [registerPostSubmit] = getErrorStrategy(postSubmit);

	return (fieldEvents, callback) => {
		formEvents.addEventListener(FormEvents.UpdateAllErrors, callback);
		if (!hasSubmitted) {
			registerPreSubmit(formEvents, fieldEvents, callback);
			formEvents.addEventListener(FormEvents.Submit, swapRegistrations);
		} else {
			registerPostSubmit(formEvents, fieldEvents, callback);
		}

		function swapRegistrations() {
			formEvents.removeEventListener(FormEvents.Submit, swapRegistrations);
			unregisterPreSubmit(formEvents, fieldEvents, callback);
			registerPostSubmit(formEvents, fieldEvents, callback);
		}
	};
}

type ApplyStrategy = (
	formEvents: FormEvents,
	fieldEvents: IFieldEvents,
	callback: EventListenerOrEventListenerObject
) => void;

function getErrorStrategy(
	strategy: ErrorsStrategy
): [register: ApplyStrategy, unregister: ApplyStrategy] {
	switch (strategy) {
		case 'onChange':
			return [
				(form, field, callback) =>
					field.addEventListener(FieldEvents.Change, callback),
				(form, field, callback) =>
					field.removeEventListener(FieldEvents.Change, callback),
			];
		case 'onBlur':
			return [
				(form, field, callback) =>
					field.addEventListener(FieldEvents.Blur, callback),
				(form, field, callback) =>
					field.removeEventListener(FieldEvents.Blur, callback),
			];
		case 'onSubmit':
			return [
				(form, field, callback) =>
					form.addEventListener(FormEvents.Submit, callback),
				(form, field, callback) =>
					form.removeEventListener(FormEvents.Submit, callback),
			];
		case 'onTouched':
			return [
				(form, field, callback) => {
					field.addEventListener(FieldEvents.Blur, callback);
					field.addEventListener(FieldEvents.Change, callback);
				},
				(form, field, callback) => {
					field.removeEventListener(FieldEvents.Blur, callback);
					field.removeEventListener(FieldEvents.Change, callback);
				},
			];
		case 'all':
			return [
				(form, field, callback) => {
					form.addEventListener(FormEvents.Submit, callback);
					field.addEventListener(FieldEvents.Blur, callback);
					field.addEventListener(FieldEvents.Change, callback);
				},
				(form, field, callback) => {
					form.removeEventListener(FormEvents.Submit, callback);
					field.removeEventListener(FieldEvents.Blur, callback);
					field.removeEventListener(FieldEvents.Change, callback);
				},
			];
		default:
			throw new Error(`Unknown error strategy: ${strategy as string}`);
	}
}
