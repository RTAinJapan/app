import { lightFormat } from "date-fns";
import type { ComponentProps } from "react";

import { Input } from "./shadcn/input";

type Props = Omit<
	ComponentProps<typeof Input>,
	"min" | "max" | "defaultValue"
> & {
	min?: Date;
	max?: Date;
	defaultValue?: Date;
};

export const DateTimePicker = ({ defaultValue, min, max, ...props }: Props) => {
	return (
		<Input
			type="datetime-local"
			required
			defaultValue={
				defaultValue && lightFormat(defaultValue, "yyyy-MM-dd'T'HH:mm")
			}
			min={min && lightFormat(min, "yyyy-MM-dd'T'HH:mm")}
			max={max && lightFormat(max, "yyyy-MM-dd'T'HH:mm")}
			{...props}
		/>
	);
};
