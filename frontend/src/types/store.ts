import type { RouteMetrics } from "@/interfaces/interfaces";
import type { Trip } from "@/interfaces/store";

export type RouteResult =
    | { status: "ready"; metrics: RouteMetrics }
    | { status: "error"; message: string };
export type RouteState = { status: "loading"; requestId: number } | RouteResult;

export type RouteStates = Partial<Record<string, RouteState>>;

export type TravelMode = "driving" | "cycling" | "walking";

export type CreateTripInput = Pick<Trip, "name" | "startDate" | "endDate">;
