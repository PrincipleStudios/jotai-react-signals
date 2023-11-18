import type {
	ZodOptional,
	ZodType,
	ZodTypeAny,
	ZodUnion,
	ZodUnionOptions,
} from 'zod';
import { z, ZodNull } from 'zod';
import type { AnyPath, Path, PathValue } from '../path';

export function getZodSchemaForPath<T, TPath extends Path<T>>(
	steps: TPath,
	schema: ZodType<T>
): ZodType<PathValue<T, TPath>>;
export function getZodSchemaForPath(
	steps: AnyPath,
	schema: ZodTypeAny
): ZodTypeAny;
export function getZodSchemaForPath(
	steps: AnyPath,
	schema: ZodTypeAny
): ZodTypeAny {
	return (steps as ReadonlyArray<string | number>).reduce(
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		(prev, next) => doStep(next, prev),
		schema
	);

	function doStep(
		step: string | number,
		current: ZodTypeAny | ZodUnion<ZodUnionOptions>
	): ZodTypeAny {
		if ('shape' in current) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			return (current.shape as never)[step] ?? current._def.catchall;
		} else if ('element' in current) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
			return (current as any).element;
		} else if ('options' in current) {
			return doStep(
				step,
				current.options.filter(
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					<T>(n: ZodNull | T): n is T => !(n instanceof ZodNull)
				)[0]
			);
		} else if ('innerType' in (current as ZodOptional<ZodTypeAny>)._def) {
			return doStep(step, (current as ZodOptional<ZodTypeAny>)._def.innerType);
		} else {
			console.warn(
				'Attempting to resolve schema during',
				{ steps, schema },
				'unable to continue at',
				{
					step,
					current,
				}
			);

			return z.undefined();
		}
	}
}
