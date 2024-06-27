export const getDateTimeInputValue = (value: Date) => {
	const adjustedDate = new Date(
		value.getTime() - value.getTimezoneOffset() * 60000,
	);
	return adjustedDate.toISOString().slice(0, 16);
};
