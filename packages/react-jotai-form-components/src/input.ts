import { withSignal, mapProperty } from '@principlestudios/jotai-react-signals';

const JotaiInput = withSignal('input', {
	defaultValue: mapProperty('value'),
	defaultChecked: mapProperty('checked'),
	disabled: mapProperty('disabled'),
	readOnly: mapProperty('readOnly'),
	className: mapProperty('className'),
});
export default JotaiInput;
