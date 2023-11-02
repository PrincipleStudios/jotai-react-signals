import type { FieldMapping } from '../types';

export const capitalizeMapping: FieldMapping<string, string> = {
	toForm(v) {
		return v.toUpperCase();
	},
	fromForm(v) {
		return v;
	},
};
