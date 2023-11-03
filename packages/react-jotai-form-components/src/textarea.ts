import { withSignal, mapProperty } from '@principlestudios/jotai-react-signals';

const JotaiTextarea = withSignal('textarea', {
	defaultValue: mapProperty('value'),
	disabled: mapProperty('disabled'),
	readOnly: mapProperty('readOnly'),
	className: mapProperty('className'),
});
export default JotaiTextarea;
