import JotaiTextarea from './textarea';
import { testAtomField } from './test/test-utils';

describe('JotaiTextarea', () => {
	testAtomField(
		JotaiTextarea,
		'defaultValue',
		'foo',
		'foobar',
		(el) => el.value
	);
	testAtomField(JotaiTextarea, 'disabled', true, false, (el) => el.disabled);
	testAtomField(JotaiTextarea, 'readOnly', true, false, (el) => el.readOnly);
	testAtomField(
		JotaiTextarea,
		'className',
		'blue',
		'red',
		(el) => el.className
	);
});
