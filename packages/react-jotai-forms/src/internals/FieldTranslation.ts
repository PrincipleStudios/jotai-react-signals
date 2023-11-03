export type FieldTranslatablePart =
	| ['label']
	| ['description']
	| ['errors', string]
	| string;
export type FieldTranslation = (
	this: void,
	part: FieldTranslatablePart
) => string;
