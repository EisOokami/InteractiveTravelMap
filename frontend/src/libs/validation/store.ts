import z from "zod";
import { isISODate, nextDate } from "../utils";

export const tripNameSchema = z
    .string()
    .trim()
    .min(1, "Trip name is required")
    .max(255);

export const idSchema = z
    .number()
    .positive()
    .int("ID must be an integer")
    .refine((value) => Number.isSafeInteger(value), {
        message: "ID is too large a numerical value",
    });

export const travelModeSchema = z.enum(["driving", "cycling", "walking"]);

export const createTripSchema = z
    .object({
        name: tripNameSchema,
        startDate: z
            .string()
            .refine(isISODate, "Use a valid YYYY-MM-DD calendar date"),
        endDate: z
            .string()
            .refine(isISODate, "Use a valid YYYY-MM-DD calendar date"),
    })
    .strict()
    .refine((trip) => trip.startDate <= trip.endDate, {
        message: "End date must be on or after start date",
        path: ["endDate"],
    });

export const tripDaySchema = z
    .object({
        date: z
            .string()
            .refine(isISODate, "Use a valid YYYY-MM-DD calendar date"),
        placeIds: z
            .array(
                z
                    .number()
                    .positive()
                    .int("ID must be an integer")
                    .refine((value) => Number.isSafeInteger(value), {
                        message: "ID is too large a numerical value",
                    }),
            )
            .refine(
                (ids) => new Set(ids).size === ids.length,
                "Duplicate place IDs",
            ),
        travelMode: travelModeSchema,
    })
    .strict();

export const tripSchema = z
    .object({
        id: z.uuid(),
        name: tripNameSchema,
        startDate: z
            .string()
            .refine(isISODate, "Use a valid YYYY-MM-DD calendar date"),
        endDate: z
            .string()
            .refine(isISODate, "Use a valid YYYY-MM-DD calendar date"),
        days: z.array(tripDaySchema).min(1),
    })
    .strict()
    .superRefine((trip, context) => {
        if (!isISODate(trip.startDate) || !isISODate(trip.endDate)) {
            return;
        }

        if (
            trip.startDate > trip.endDate ||
            trip.days[0]?.date !== trip.startDate ||
            trip.days.at(-1)?.date !== trip.endDate
        ) {
            context.addIssue({
                code: "custom",
                message: "Trip days must cover the entire date range",
            });

            return;
        }

        let expected = trip.startDate;

        for (const [index, day] of trip.days.entries()) {
            if (day.date !== expected) {
                context.addIssue({
                    code: "custom",
                    message: "Trip days must be consecutive and ordered",
                });

                return;
            }

            if (index < trip.days.length - 1) {
                expected = nextDate(expected);
            }
        }
    });

export const storedTripsSchema = z
    .object({
        version: z.literal(1),
        userId: z
            .number()
            .positive()
            .int("ID must be an integer")
            .refine((value) => Number.isSafeInteger(value), {
                message: "ID is too large a numerical value",
            }),
        trips: z
            .array(tripSchema)
            .refine(
                (trips) =>
                    new Set(trips.map((trip) => trip.id)).size === trips.length,
                "Duplicate trip IDs",
            ),
    })
    .strict();
