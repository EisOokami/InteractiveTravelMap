import { z } from "zod";

export const analysisSchema = z.strictObject({
    summary: z
        .string()
        .trim()
        .min(1, "Summary cannot be empty")
        .max(600, "Summary must be at most 600 characters"),
    suggestedPlaceIds: z
        .array(
            z.number().int().positive("Place ID must be a positive number"),
            "Suggested place IDs must be an array",
        )
        .min(1, "At least 1 suggested place ID is required")
        .max(15, "No more than 15 suggested place IDs are allowed"),
    recommendations: z
        .array(
            z.strictObject({
                type: z.enum(["order", "pace", "planning"]),
                message: z
                    .string()
                    .trim()
                    .min(1, "Message cannot be empty")
                    .max(400, "Message must be at most 400 characters"),
            }),
            "Recommendations must be an array",
        )
        .min(1, "At least 1 recommendation is required")
        .max(3, "No more than 3 recommendations are allowed"),
    warnings: z
        .array(
            z
                .string()
                .trim()
                .min(1, "Warning cannot be empty")
                .max(400, "Warning must be at most 400 characters"),
            "Warnings must be an array",
        )
        .max(3, "No more than 3 warnings are allowed"),
});
