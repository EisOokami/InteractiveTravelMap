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
    name: z.string().max(255).optional(),
    category: z.string().max(100).optional(),
    location: z.string().max(100).optional(),
    minPrice: z.preprocess(
        (v) => (typeof v === "string" && v !== "" ? Number(v) : v),
        z.number().min(0).max(9999).optional(),
    ),
    maxPrice: z.preprocess(
        (v) => (typeof v === "string" && v !== "" ? Number(v) : v),
        z.number().min(0).max(9999).optional(),
    ),
    sort: z.string().optional(),
    parking: z.preprocess(
        (v) =>
            v === "1" || v === "true"
                ? true
                : v === "0" || v === "false"
                  ? false
                  : v,
        z.boolean().optional(),
    ),
    pet_friendly: z.preprocess(
        (v) =>
            v === "1" || v === "true"
                ? true
                : v === "0" || v === "false"
                  ? false
                  : v,
        z.boolean().optional(),
    ),
    wheelchair_access: z.preprocess(
        (v) =>
            v === "1" || v === "true"
                ? true
                : v === "0" || v === "false"
                  ? false
                  : v,
        z.boolean().optional(),
    ),
    wifi: z.preprocess(
        (v) =>
            v === "1" || v === "true"
                ? true
                : v === "0" || v === "false"
                  ? false
                  : v,
        z.boolean().optional(),
    ),
    limit: z.preprocess(
        (v) => (typeof v === "string" && v !== "" ? Number(v) : v),
        z.number().int().min(1).max(500).optional(),
    ),
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
