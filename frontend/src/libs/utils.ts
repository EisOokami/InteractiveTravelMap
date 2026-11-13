import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createTripSchema } from "./validation/store";
import { Trip, TripDay } from "@/interfaces/store";
import { DayRoutePlan, IPlace } from "@/interfaces/interfaces";
import { RouteStates } from "@/types/store";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatBackupCode(raw: string): string {
    const cleaned = raw
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, 8);

    if (cleaned.length <= 4) {
        return cleaned;
    }

    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
}

export const formatDuration = (minutes: number) => {
    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

export const distance = (meters: number) => {
    return meters < 1000
        ? `${Math.round(meters)} m`
        : `${(meters / 1000).toLocaleString("pl-PL", { maximumFractionDigits: 1 })} km`;
};

export const duration = (seconds: number) => {
    return formatDuration(Math.ceil(seconds / 60));
};

export const formatPrice = (price: number) => {
    return price === 0 ? "Free" : `${price} $`;
};

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export function formatTripDate(date: string): string {
    const [year, month, day] = date.split("-");

    return `${Number(day)} ${months[Number(month) - 1]} ${year}`;
}

export function daysInMonth(year: number, month: number): number {
    const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

    return [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][
        month - 1
    ];
}

export function isISODate(date: string): boolean {
    if (!/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(date)) {
        return false;
    }

    const [year, month, day] = date.split("-").map(Number);

    return year > 0 && day <= daysInMonth(year, month);
}

export function nextDate(date: string): string {
    let [year, month, day] = date.split("-").map(Number);

    day += 1;

    if (day > daysInMonth(year, month)) {
        day = 1;
        month += 1;

        if (month > 12) {
            month = 1;
            year += 1;
        }
    }

    return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function calendarDates(
    startDate: string,
    endDate: string,
    dates: string[] = [],
): string[] {
    createTripSchema.parse({ name: "Calendar", startDate, endDate });

    const updated = [...dates, startDate];

    return startDate === endDate
        ? updated
        : calendarDates(nextDate(startDate), endDate, updated);
}

export function coordinateNumber(value: unknown): number | null {
    if (typeof value === "string") {
        const trimmed = value.trim();

        if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(trimmed)) {
            return null;
        }

        value = Number(trimmed);
    }

    return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function normalizeCoordinates(place: {
    x: unknown;
    y: unknown;
}): [number, number] | null {
    const latitude = coordinateNumber(place.x);
    const longitude = coordinateNumber(place.y);

    if (
        latitude === null ||
        longitude === null ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        return null;
    }

    return [latitude, longitude];
}

export function planDayRoute(
    day: TripDay,
    placesById: Map<number, IPlace>,
): DayRoutePlan {
    const points: [number, number][] = [];
    const issues: string[] = [];

    const stops = day.placeIds.map((id) => {
        const place = placesById.get(id);

        if (!place) {
            issues.push(`Place #${id} is unavailable.`);

            return [id, "missing"];
        }

        const coordinates = normalizeCoordinates(place);

        if (coordinates === null) {
            issues.push(`${place.name} (#${id}) has invalid coordinates.`);

            return [id, "invalid"];
        }

        points.push(coordinates);

        return [id, ...coordinates];
    });

    return {
        key: JSON.stringify([day.travelMode, stops]),
        points,
        issues,
        stopCount: day.placeIds.length,
    };
}

export function tripRouteTotals(
    trip: Trip,
    placesById: Map<number, IPlace>,
    states: RouteStates,
) {
    let totalDistance = 0;
    let totalTime = 0;
    let calculatedDays = 0;
    let requiredDays = 0;

    trip.days.forEach((day) => {
        const plan = planDayRoute(day, placesById);

        if (!(plan.issues.length || plan.stopCount >= 2)) {
            return;
        }

        requiredDays += 1;

        const state = states[plan.key];

        if (
            plan.issues.length ||
            state === undefined ||
            state.status !== "ready" ||
            !(
                Number.isFinite(state.metrics.totalDistance) &&
                state.metrics.totalDistance >= 0 &&
                Number.isFinite(state.metrics.totalTime) &&
                state.metrics.totalTime >= 0
            )
        ) {
            return;
        }

        totalDistance += state.metrics.totalDistance;
        totalTime += state.metrics.totalTime;
        calculatedDays += 1;
    });

    return {
        totalDistance,
        totalTime,
        calculatedDays,
        requiredDays,
        complete: calculatedDays === requiredDays,
    };
}

export function createRouteCache<T>() {
    const values = new Map<string, T>();
    const pending = new Map<string, Promise<T>>();

    let generation = 0;

    return {
        peek: (key: string) => values.get(key),
        load(key: string, fetchRoute: () => Promise<T>): Promise<T> {
            if (values.has(key)) {
                return Promise.resolve(values.get(key)!);
            }

            const existing = pending.get(key);

            if (existing) {
                return existing;
            }

            const current = generation;
            const request = Promise.resolve()
                .then(fetchRoute)
                .then((value) => {
                    if (generation === current) {
                        values.set(key, value);
                    }

                    return value;
                })
                .finally(() => {
                    if (pending.get(key) === request) {
                        pending.delete(key);
                    }
                });

            pending.set(key, request);

            return request;
        },
        clear() {
            generation += 1;

            values.clear();
            pending.clear();
        },
    };
}
