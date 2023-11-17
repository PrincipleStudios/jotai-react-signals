export function neverEver(something: never): never {
	throw new Error(`Something happened that never should have: ${something}`);
}
