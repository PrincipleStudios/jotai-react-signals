import JotaiSelect from './select';
import { testAtomField } from './test/test-utils';

describe('JotaiSelect', () => {
	function SelectWithContents(props: React.ComponentProps<typeof JotaiSelect>) {
		return (
			<JotaiSelect {...props}>
				<option value="foo">Foo</option>
				<option value="foobar">Foobar</option>
			</JotaiSelect>
		);
	}
	testAtomField(
		SelectWithContents,
		'defaultValue',
		'foo',
		'foobar',
		(el) => el.value
	);
	testAtomField(JotaiSelect, 'disabled', true, false, (el) => el.disabled);
	testAtomField(JotaiSelect, 'className', 'blue', 'red', (el) => el.className);
});
