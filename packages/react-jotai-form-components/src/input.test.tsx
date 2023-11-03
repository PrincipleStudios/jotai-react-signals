import JotaiInput from './input';
import { testAtomField } from './test/test-utils';

describe('JotaiInput', () => {
	testAtomField(JotaiInput, 'defaultValue', 'foo', 'foobar', (el) => el.value);
	testAtomField(JotaiInput, 'defaultChecked', true, false, (el) => el.checked);
	testAtomField(JotaiInput, 'disabled', true, false, (el) => el.disabled);
	testAtomField(JotaiInput, 'readOnly', true, false, (el) => el.readOnly);
	testAtomField(JotaiInput, 'className', 'blue', 'red', (el) => el.className);
});
