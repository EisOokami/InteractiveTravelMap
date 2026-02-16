import { z } from "zod";

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
