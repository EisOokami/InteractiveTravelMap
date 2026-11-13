import { pool } from "../db/pool.js";
import { Request, Response } from "express";
import { IPlace } from "../types/interfaces.js";
import { getPlacesSchema } from "../validation/validation.js";

export const getPlaces = async (req: Request, res: Response) => {
    try {
        const validateData = getPlacesSchema.parse(req.query);

        const {
            name,
            category,
            location,
            minPrice,
            maxPrice,
            sort,
            parking,
            pet_friendly,
            wheelchair_access,
            wifi,
            limit,
        } = validateData;

        if (
            minPrice !== undefined &&
            maxPrice !== undefined &&
            maxPrice < minPrice
        ) {
            return res.status(400).json({
                message: "maxPrice must be greater than or equal to minPrice",
            });
        }

        const whereClauses: string[] = [];
        const params: (string | number)[] = [];

        if (name && String(name).trim() !== "") {
            whereClauses.push("LOWER(p.name) LIKE ?");
            params.push(`%${String(name).toLowerCase()}%`);
        }

        if (category && String(category) !== "all") {
            whereClauses.push("p.category = ?");
            params.push(String(category));
        }

        if (location && String(location) !== "all") {
            whereClauses.push("p.location = ?");
            params.push(String(location));
        }

        if (minPrice !== undefined) {
            params.push(minPrice);
            whereClauses.push("p.price >= ?");
        }

        if (maxPrice !== undefined) {
            params.push(maxPrice);
            whereClauses.push("p.price <= ?");
        }

        if (parking !== undefined) {
            whereClauses.push("f.parking = 1");
        }

        if (pet_friendly !== undefined) {
            whereClauses.push("f.pet_friendly = 1");
        }

        if (wheelchair_access !== undefined) {
            whereClauses.push("f.wheelchair_access = 1");
        }

        if (wifi !== undefined) {
            whereClauses.push("f.wifi = 1");
        }

        const sortMap: Record<string, string> = {
            price_asc: "p.price ASC",
            price_desc: "p.price DESC",
            rating_desc: "p.rating DESC",
            name_asc: "p.name ASC",
            name_desc: "p.name DESC",
        };

        const orderBy = sort && sortMap[sort] ? sortMap[sort] : undefined;

        const whereSql = whereClauses.length
            ? `WHERE ${whereClauses.join(" AND ")}`
            : "";
        const orderSql = orderBy ? `ORDER BY ${orderBy}` : "";

        const safeLimit = limit ? Math.min(limit, 500) : 100;
        params.push(safeLimit);

        const [places] = await pool.execute<IPlace[]>(
            `
                SELECT 
                    p.*,
                    JSON_OBJECT(
                        'parking', f.parking,
                        'pet_friendly', f.pet_friendly,
                        'wheelchair_access', f.wheelchair_access,
                        'wifi', f.wifi
                    ) AS facilities,
                    JSON_OBJECTAGG(wh.day, wh.hours) AS working_hours 
                FROM places p
                JOIN facilities f ON f.place_id = p.id 
                JOIN working_hours wh ON wh.place_id = p.id
                ${whereSql}
                GROUP BY p.id
                ${orderSql}
                LIMIT ?
            `,
            params,
        );

        const rows = places.map((place) => ({
            ...place,
            facilities: {
                parking: !!JSON.parse(place.facilities).parking,
                pet_friendly: !!JSON.parse(place.facilities).pet_friendly,
                wheelchair_access: !!JSON.parse(place.facilities)
                    .wheelchair_access,
                wifi: !!JSON.parse(place.facilities).wifi,
            },
            price: +place.price,
            working_hours: JSON.parse(place.working_hours),
        }));

        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
};

export const getPlaceById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const [places] = await pool.execute<IPlace[]>(
            `
                SELECT 
                    p.*,
                    JSON_OBJECT(
                        'parking', f.parking,
                        'pet_friendly', f.pet_friendly,
                        'wheelchair_access', f.wheelchair_access,
                        'wifi', f.wifi
                    ) AS facilities,
                    JSON_OBJECTAGG(wh.day, wh.hours) AS working_hours 
                FROM places p
                JOIN facilities f ON f.place_id = p.id 
                JOIN working_hours wh ON wh.place_id = p.id
                WHERE p.id = ?
                GROUP BY p.id
            `,
            [id],
        );

        const rows = places.map((place) => ({
            ...place,
            facilities: {
                parking: !!JSON.parse(place.facilities).parking,
                pet_friendly: !!JSON.parse(place.facilities).pet_friendly,
                wheelchair_access: !!JSON.parse(place.facilities)
                    .wheelchair_access,
                wifi: !!JSON.parse(place.facilities).wifi,
            },
            price: +place.price,
            working_hours: JSON.parse(place.working_hours),
        }));

        res.json(rows[0] || {});
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
};
