A simple structure indicating a value that may or may not be loaded, but also encapsulates
a range of intermediate states, including:

- Not yet loading
- Error states
- Loading with previous value
- Loading with no previous value

Used for:

- wrapping libraries for future compatability
- interop across project boundaries
- ensuring developers encapsulate all possible loading states in contract boundaries

This package also includes a few helpers for working with the structure, including creating
the structure and unwrapping it while following functional design patterns.
