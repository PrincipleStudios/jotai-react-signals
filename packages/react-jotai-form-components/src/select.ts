import { withSignal, mapProperty } from '@principlestudios/jotai-react-signals';

const JotaiSelect = withSignal('select', {
	defaultValue: mapProperty('value'),
	disabled: mapProperty('disabled'),
	className: mapProperty('className'),
});
export default JotaiSelect;
