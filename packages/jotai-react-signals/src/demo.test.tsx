import { atom } from 'jotai';
import { render } from '@testing-library/react';
import { withSignal, mapAttribute, type PartialMapping } from './index';

describe('readme example', () => {
	it('compiles', () => {
		const sampleMapping = {
			cx: mapAttribute('cx'),
			cy: mapAttribute('cy'),
			r: mapAttribute('r'),
			strokeWidth: mapAttribute('stroke-width'),
		} satisfies PartialMapping;

		const AnimatedCircle = withSignal('circle', sampleMapping);

		const r$ = atom(5);
		const strokeWidth$ = atom(1);

		render(
			<svg width="300px" height="300px">
				<AnimatedCircle
					cx={150}
					cy={150}
					r={atom((get) => get(r$).toFixed(3))}
					strokeWidth={atom((get) => get(strokeWidth$).toFixed(3))}
					stroke="red"
					fill="none"
				/>
			</svg>
		);

		// This doesn't actually do anything, just makes sure it will build. TODO: make this test better
	});
});
