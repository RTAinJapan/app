import { z } from "zod";

import { EventStatus } from "./constants";

export const eventSlugSchema = z.string().regex(/^[a-z0-9-]+$/);

export const dateTimeInputSchema = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);

export const eventStatusSchema = z.enum([
	EventStatus.Hidden,
	EventStatus.Visible,
	EventStatus.Open,
]);
