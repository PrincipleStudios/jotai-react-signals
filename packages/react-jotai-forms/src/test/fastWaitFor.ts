import { waitFor } from '@testing-library/react';

export const fastWaitFor: typeof waitFor = async (fn, options) => {
	return waitFor(fn, { interval: 1, ...options });
};
