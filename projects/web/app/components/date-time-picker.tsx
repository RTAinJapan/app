import { formatDate } from "date-fns/format";
import { TextInput } from "flowbite-react";

export const DateTimePicker = ({
	name,
	defaultValue,
	min,
	max,
	id,
}: {
	name: string;
	defaultValue?: Date;
	min?: Date;
	max?: Date;
	id?: string;
}) => {
	return (
		<TextInput
			id={id}
			name={name}
			type="datetime-local"
			required
			defaultValue={
				defaultValue && formatDate(defaultValue, "yyyy-MM-ddTHH:mm")
			}
			min={min && formatDate(min, "yyyy-MM-dd'T'HH:mm")}
			max={max && formatDate(max, "yyyy-MM-dd'T'HH:mm")}
		/>
	);
};
