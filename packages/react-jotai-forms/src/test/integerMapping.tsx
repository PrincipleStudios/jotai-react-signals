import type { FieldMapping } from '../types';
import { noChange } from '../constants';

export const integerMapping: FieldMapping<number, string> = {
	toForm(v) {
		return v.toFixed(0);
	},
	fromForm(v) {
		const result = parseInt(v, 10);
		return isNaN(result) ? noChange : result;
	},
};
