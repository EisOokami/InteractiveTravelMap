import { z } from "zod";

export const registerSchema = z.object({
    email: z
        .email("Invalid email format")
        .trim()
        .toLowerCase()
        .min(1, "Email is required")
        .max(100, "Email must be less than 100 characters long"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(50, "Password must be less than 50 characters long")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?])/,
            "Password must contain at least one uppercase letter, one lowercase letter, one special character and one number",
        ),
    username: z
        .string()
        .trim()
        .min(2, "Username must be at least 2 characters")
        .max(50, "Username must be less than 50 characters"),
});

export const loginSchema = z.object({
    email: z
        .email("Invalid email format")
        .trim()
        .toLowerCase()
        .min(1, "Email is required")
        .max(100, "Email must be less than 100 characters long"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(50, "Password must be less than 50 characters long")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?])/,
            "Password must contain at least one uppercase letter, one lowercase letter, one special character and one number",
        ),
});

export const getPlacesSchema = z.object({
    name: z.string().max(255, "Name must be at most 255 characters").optional(),
    category: z
        .string()
        .max(100, "Category must be at most 100 characters")
        .optional(),
    location: z
        .string()
        .max(100, "Location must be at most 100 characters")
        .optional(),
    minPrice: z.preprocess(
        (value) =>
            typeof value === "string" && value !== "" ? Number(value) : value,
        z
            .number()
            .min(0, "Minimum price cannot be negative")
            .max(9999, "Minimum price cannot exceed 9999")
            .optional(),
    ),
    maxPrice: z.preprocess(
        (value) =>
            typeof value === "string" && value !== "" ? Number(value) : value,
        z
            .number()
            .min(0, "Maximum price cannot be negative")
            .max(9999, "Maximum price cannot exceed 9999")
            .optional(),
    ),
    sort: z.string().optional(),
    parking: z.preprocess(
        (value) =>
            value === "1" || value === "true"
                ? true
                : value === "0" || value === "false"
                  ? false
                  : value,
        z.boolean().optional(),
    ),
    pet_friendly: z.preprocess(
        (value) =>
            value === "1" || value === "true"
                ? true
                : value === "0" || value === "false"
                  ? false
                  : value,
        z.boolean().optional(),
    ),
    wheelchair_access: z.preprocess(
        (value) =>
            value === "1" || value === "true"
                ? true
                : value === "0" || value === "false"
                  ? false
                  : value,
        z.boolean().optional(),
    ),
    wifi: z.preprocess(
        (value) =>
            value === "1" || value === "true"
                ? true
                : value === "0" || value === "false"
                  ? false
                  : value,
        z.boolean().optional(),
    ),
    limit: z.preprocess(
        (value) =>
            typeof value === "string" && value !== "" ? Number(value) : value,
        z
            .number()
            .int()
            .min(1, "Limit must be at least 1")
            .max(500, "Limit cannot exceed 500")
            .optional(),
    ),
});

export const updateProfileSchema = z.object({
    email: z
        .email("Invalid email format")
        .trim()
        .toLowerCase()
        .min(1, "Email is required")
        .max(100, "Email must be less than 100 characters long"),
    username: z
        .string()
        .trim()
        .min(2, "Username must be at least 2 characters")
        .max(50, "Username must be less than 50 characters"),
});

export const changePasswordSchema = z
    .object({
        currentPassword: z
            .string()
            .min(8, "Password must be at least 8 characters long")
            .max(50, "Password must be less than 50 characters long")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?])/,
                "Password must contain at least one uppercase letter, one lowercase letter, one special character and one number",
            ),
        newPassword: z
            .string()
            .min(8, "Password must be at least 8 characters long")
            .max(50, "Password must be less than 50 characters long")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?])/,
                "Password must contain at least one uppercase letter, one lowercase letter, one special character and one number",
            ),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "Passwords are the same",
        path: ["confirmPassword"],
    });

export const validateIdSchema = z.object({
    id: z
        .number()
        .positive()
        .int("ID must be an integer")
        .refine((value) => Number.isSafeInteger(value), {
            message: "ID is too large a numerical value",
        }),
});

export const forgotPasswordSchema = z.object({
    email: z
        .email("Invalid email format")
        .trim()
        .toLowerCase()
        .min(1, "Email is required")
        .max(100, "Email must be less than 100 characters long"),
});

export const resetPasswordSchema = z.object({
    token: z
        .string("Invalid data")
        .trim()
        .min(60, "Invalid data")
        .max(70, "Invalid data"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(50, "Password must be less than 50 characters long")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^&*()_+=\-\[\]\\|;:'",.<>/?])/,
            "Password must contain at least one uppercase letter, one lowercase letter, one special character and one number",
        ),
    id: z.number("Invalid data").int("Invalid data").positive("Invalid data"),
});

export const tripAnalysisRequestSchema = z.strictObject({
    day: z.iso.date("Day must be a valid ISO date (YYYY-MM-DD)"),
    places: z
        .array(
            z.strictObject({
                id: z
                    .number()
                    .positive()
                    .int("ID must be an integer")
                    .refine((value) => Number.isSafeInteger(value), {
                        message: "ID is too large a numerical value",
                    }),
                name: z
                    .string()
                    .trim()
                    .min(1, "Name cannot be empty")
                    .max(255, "Name must be at most 255 characters"),
                latitude: z
                    .number()
                    .min(-90, "Latitude must be at least -90")
                    .max(90, "Latitude must be at most 90"),
                longitude: z
                    .number()
                    .min(-180, "Longitude must be at least -180")
                    .max(180, "Longitude must be at most 180"),
            }),
            "Places must be an array",
        )
        .min(1, "At least 1 place is required")
        .max(15, "No more than 15 places are allowed")
        .refine(
            (places) =>
                new Set(places.map((place) => place.id)).size === places.length,
            "Place IDs must be unique",
        ),
    travelMode: z.enum(["driving", "cycling", "walking"]),
    routeMetrics: z
        .strictObject({
            distanceMeters: z
                .number()
                .min(0, "Distance cannot be negative")
                .max(100000000, "Distance is too large"),
            durationSeconds: z
                .number()
                .min(0, "Duration cannot be negative")
                .max(10000000, "Duration is too large"),
        })
        .optional(),
    preferences: z
        .strictObject({
            pace: z.enum(["relaxed", "balanced", "intensive"]).optional(),
            instructions: z
                .string()
                .max(300, "Instructions must be at most 300 characters")
                .optional(),
        })
        .optional(),
});

export const tripAnalysisResponseSchema = z.strictObject({
    summary: z
        .string()
        .trim()
        .min(1, "Summary cannot be empty")
        .max(600, "Summary must be at most 600 characters"),
    suggestedPlaceIds: z
        .array(
            z
                .number()
                .positive()
                .int("ID must be an integer")
                .refine((value) => Number.isSafeInteger(value), {
                    message: "ID is too large a numerical value",
                }),
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
