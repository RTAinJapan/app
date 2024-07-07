import { lightFormat } from "date-fns/lightFormat";
import { TextInput } from "flowbite-react";
import type { ComponentProps } from "react";

type Props = Omit<
	ComponentProps<typeof TextInput>,
	"min" | "max" | "defaultValue"
> & {
	min?: Date;
	max?: Date;
	defaultValue?: Date;
};

export const DateTimePicker = ({ defaultValue, min, max, ...props }: Props) => {
	return (
		<TextInput
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
