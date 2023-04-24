import { Spy } from './spy';

export class RequestAnimationFrameMock {
	private counter = 0;
	private readonly registrations = new Map<number, FrameRequestCallback>();
	private lastTick = 0;

	public requestAnimationFrameSpy?: Spy<typeof requestAnimationFrame>;
	public cancelAnimationFrameSpy?: Spy<typeof cancelAnimationFrame>;

	readonly spy = () => {
		this.requestAnimationFrameSpy = jest
			.spyOn(window, 'requestAnimationFrame')
			.mockImplementation(this.register);
		this.cancelAnimationFrameSpy = jest
			.spyOn(window, 'cancelAnimationFrame')
			.mockImplementation(this.unregister);
	};

	readonly restore = () => {
		this.requestAnimationFrameSpy?.mockRestore();
		this.cancelAnimationFrameSpy?.mockRestore();
	};

	get registrationCount() {
		return this.registrations.size;
	}

	readonly register: typeof requestAnimationFrame = (
		callback: FrameRequestCallback
	) => {
		const current = ++this.counter;
		this.registrations.set(current, callback);
		return current;
	};

	readonly unregister: typeof cancelAnimationFrame = (handle: number) => {
		this.registrations.delete(handle);
	};

	readonly tick = (time: DOMHighResTimeStamp) => {
		const callbacks = Array.from(this.registrations.values());
		this.registrations.clear();
		this.lastTick = time;
		callbacks.forEach((cb) => cb(time));
	};

	readonly getTick = () => this.lastTick;
}
