import type { NextFunction, Request, Response } from "express";
import { requestRoute } from "../utils/logger.js";

export function errorMiddleware(
    error: unknown,
    req: Request,
    res: Response,
    _next: NextFunction,
) {
    const status =
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof error.status === "number" &&
        Number.isInteger(error.status) &&
        error.status >= 400 &&
        error.status < 500
            ? error.status
            : undefined;

    const clientError =
        status !== undefined ||
        (error instanceof Error && error.name === "ZodError");

    if (!clientError) {
        console.log(error);

        req.log.error(
            { err: error, event: "request.failed", route: requestRoute(req) },
            "Unhandled request failure",
        );
    }

    if (res.headersSent) {
        res.destroy();

        return;
    }

    res.status(clientError ? (status ?? 400) : 500).json({
        status: "error",
        message: clientError ? "Invalid request" : "Internal server error",
    });
}
