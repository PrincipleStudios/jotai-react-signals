# React Jotai Form Components

Provides a few basic form components for use with `@principlestudios/react-jotai-forms` by leveraging `@principlestudios/jotai-react-signals`.

Four individual imports are provided with this package:

- `@principlestudios/react-jotai-form-components/atom-contents` provides a component that will render an atom passed to the children of the component within a fragment. This could be useful when rendering error messages or other React elements.

  ```jsx
  import AtomContents from '@principlestudios/react-jotai-form-components/atom-contents';

  <AtomContents>{atom}</AtomContents>;
  ```

- `@principlestudios/react-jotai-form-components/input` provides an input element that allows React to treat the input element as an uncontrolled component, but an atom passed to `defaultValue` or `defaultChecked` will update the element without a React rerender. Also maps `className`, `disabled`, and `readOnly` to allow atoms.

  ```jsx
  import JotaiInput from '@principlestudios/react-jotai-form-components/input';

  <JotaiInput defaultValue={atom} />;
  ```

- `@principlestudios/react-jotai-form-components/select` provides a select element that allows React to treat the select element as an uncontrolled component, but an atom passed to `defaultValue` will update the element without a React rerender. Also maps `className` and `disabled` to allow atoms.

  ```jsx
  import JotaiSelect from '@principlestudios/react-jotai-form-components/select';

  <JotaiSelect defaultValue={atom} />;
  ```

- `@principlestudios/react-jotai-form-components/textarea` provides a textarea element that allows React to treat the textarea element as an uncontrolled component, but an atom passed to `defaultValue` will update the element without a React rerender. Also maps `className`, `disabled`, and `readOnly` to allow atoms.

  ```jsx
  import JotaiTextarea from '@principlestudios/react-jotai-form-components/textarea';

  <JotaiTextarea defaultValue={atom} />;
  ```
