import { pool } from "../db/pool";
import { Response } from "express";
import { IFavorite, IGetUserRequest } from "../types/interfaces";
import { ResultSetHeader } from "mysql2";
import { validateIdSchema } from "../validation/validation";
import { ZodError } from "zod";

export const getFavorites = async (req: IGetUserRequest, res: Response) => {
    try {
        const { id } = req.user;

        const [favorites] = await pool.execute<IFavorite[]>(
            `
                SELECT 
                    p.*,
                    JSON_OBJECT(
                        'parking', fc.parking,
                        'pet_friendly', fc.pet_friendly,
                        'wheelchair_access', fc.wheelchair_access,
                        'wifi', fc.wifi
                    ) AS facilities,
                    JSON_OBJECTAGG(wh.day, wh.hours) AS working_hours 
                FROM favorites fv 
                JOIN places p ON fv.place_id = p.id
                JOIN facilities fc ON fc.place_id = p.id 
                JOIN working_hours wh ON wh.place_id = p.id
                WHERE user_id = ?
                GROUP BY p.id;
            `,
            [id],
        );
        const result = favorites.map((favorite) => ({
            ...favorite,
            facilities: {
                parking: !!JSON.parse(favorite.facilities).parking,
                pet_friendly: !!JSON.parse(favorite.facilities).pet_friendly,
                wheelchair_access: !!JSON.parse(favorite.facilities)
                    .wheelchair_access,
                wifi: !!JSON.parse(favorite.facilities).wifi,
            },
            price: +favorite.price,
            working_hours: JSON.parse(favorite.working_hours),
        }));

        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Database error" });
    }
};

export const addItemToFavorite = async (
    req: IGetUserRequest,
    res: Response,
) => {
    try {
        validateIdSchema.parse(req.body);

        const userId = req.user.id;
        const placeId = req.body.id;

        if (!placeId) {
            res.status(400).json({
                status: "error",
                message: "Place ID is required",
            });

            return;
        }

        const [result] = await pool.execute<ResultSetHeader>(
            "INSERT INTO favorites (user_id, place_id) VALUES (?, ?)",
            [userId, placeId],
        );

        if (result.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to add item",
            });

            return;
        }

        res.status(201).json({
            status: "success",
            message: "Added to favorites",
            id: result.insertId,
        });
    } catch (error: any) {
        console.error(error);

        if (error instanceof ZodError) {
            const errorMessages = error.issues.map((issue: any) => ({
                field: issue.path[0],
                message: issue.message,
            }));

            res.status(400).json({
                error: "Invalid data",
                details: errorMessages,
            });

            return;
        }

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                status: "error",
                message: "Item already in favorites",
            });
        }

        res.status(500).json({ status: "error", message: "Database error" });
    }
};

export const removeItemFromFavorite = async (
    req: IGetUserRequest,
    res: Response,
) => {
    try {
        const userId = req.user.id;
        const placeId = req.params.id;

        if (!placeId) {
            res.status(400).json({
                status: "error",
                message: "Place ID is required",
            });

            return;
        }

        const [result] = await pool.execute<ResultSetHeader>(
            "DELETE FROM favorites WHERE user_id = ? AND place_id = ?",
            [userId, +placeId],
        );

        if (result.affectedRows === 0) {
            res.status(404).json({
                status: "error",
                message: "Item not found in favorites",
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "Removed from favorites",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Database error" });
    }
};
