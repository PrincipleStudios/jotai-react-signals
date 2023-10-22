import { FormEvents } from './FormEvents';

const blurEvent = 'blur';
const changeEvent = 'change';
type FieldEventNames = typeof blurEvent | typeof changeEvent;
const formEventEquivalents = {
	[blurEvent]: FormEvents.AnyBlur,
	[changeEvent]: FormEvents.AnyChange,
} as const;

export interface IFieldEvents {
	addEventListener(
		event: FieldEventNames,
		eventListener: EventListenerOrEventListenerObject,
		options?: AddEventListenerOptions | boolean,
	): void;

	removeEventListener(
		event: FieldEventNames,
		eventListener: EventListenerOrEventListenerObject,
		options?: AddEventListenerOptions | boolean,
	): void;

	dispatchEvent(event: FieldEventNames): void;
}

export class FieldEvents implements IFieldEvents {
	static readonly Blur = blurEvent;
	static readonly Change = changeEvent;
	private readonly target = new EventTarget();

	constructor(private formEvents?: FormEvents) {}

	addEventListener(
		event: FieldEventNames,
		eventListener: EventListenerOrEventListenerObject,
		options?: AddEventListenerOptions | boolean,
	) {
		this.target.addEventListener(event, eventListener, options);
	}

	removeEventListener(
		event: FieldEventNames,
		eventListener: EventListenerOrEventListenerObject,
		options?: AddEventListenerOptions | boolean,
	) {
		this.target.removeEventListener(event, eventListener, options);
	}

	dispatchEvent(event: FieldEventNames) {
		this.target.dispatchEvent(new Event(event));
		this.formEvents?.dispatchEvent(formEventEquivalents[event]);
	}
}
