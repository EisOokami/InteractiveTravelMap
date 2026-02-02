import { pool } from "../db/pool";
import { Request, Response } from "express";
import { IPlace } from "../types/interfaces";

export const getPlaces = async (req: Request, res: Response) => {
    try {
        const [places] = await pool.execute<IPlace[]>(`
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
            GROUP BY p.id
        `);

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

        res.json(rows);
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
