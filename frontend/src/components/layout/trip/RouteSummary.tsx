"use client";

import { useMemo } from "react";
import type { IPlace } from "@/interfaces/interfaces";
import { Button } from "@/components/ui/shadcn/button";
import {
    distance,
    duration,
    planDayRoute,
    tripRouteTotals,
} from "@/libs/utils";
import { useTripsStore } from "@/libs/stores/tripsStoreProvider";
import { Trip, TripDay } from "@/interfaces/store";

const modeNames = {
    driving: "Driving",
    cycling: "Cycling",
    walking: "Walking",
};

interface RouteSummaryProps {
    trip: Trip;
    day: TripDay;
    placesById: Map<number, IPlace>;
}

export default function RouteSummary({
    trip,
    day,
    placesById,
}: Readonly<RouteSummaryProps>) {
    const states = useTripsStore((state) => state.routeStates);
    const retryRoute = useTripsStore((state) => state.retryRoute);

    const plan = useMemo(
        () => planDayRoute(day, placesById),
        [day, placesById],
    );
    const totals = useMemo(
        () => tripRouteTotals(trip, placesById, states),
        [trip, placesById, states],
    );

    const result = states[plan.key];
    const metrics =
        !plan.issues.length &&
        plan.stopCount >= 2 &&
        result !== undefined &&
        result.status === "ready"
            ? result.metrics
            : null;
    const loading =
        !plan.issues.length &&
        plan.stopCount >= 2 &&
        result !== undefined &&
        result.status === "loading";

    return (
        <section className="grid gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-mode-black p-4">
            <h3 className="font-semibold">Route Summary</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <dt className="text-muted-foreground">Day distance</dt>
                    <dd className="font-semibold">
                        {metrics
                            ? distance(metrics.totalDistance)
                            : "Not available"}
                    </dd>
                </div>
                <div>
                    <dt className="text-muted-foreground">Travel time</dt>
                    <dd className="font-semibold">
                        {metrics
                            ? duration(metrics.totalTime)
                            : "Not available"}
                    </dd>
                </div>
                <div>
                    <dt className="text-muted-foreground">Planned stops</dt>
                    <dd>{day.placeIds.length}</dd>
                </div>
                <div>
                    <dt className="text-muted-foreground">Transport</dt>
                    <dd>{modeNames[day.travelMode]}</dd>
                </div>
            </dl>
            {plan.issues.length > 0 ? (
                <div className="text-sm text-amber-800 dark:text-amber-300">
                    <p>
                        Route not calculated. Resolve these stops to keep your
                        full itinerary:
                    </p>
                    <ul className="mt-1 list-disc pl-4">
                        {plan.issues.map((issue) => (
                            <li key={issue}>{issue}</li>
                        ))}
                    </ul>
                </div>
            ) : plan.stopCount < 2 ? (
                <p className="text-sm text-muted-foreground">
                    {plan.stopCount
                        ? "One stop: no travel route is needed."
                        : "Add at least two stops to calculate a route."}
                </p>
            ) : loading ? (
                <p className="text-sm text-muted-foreground">
                    Calculating route...
                </p>
            ) : result !== undefined && result.status === "error" ? (
                <div className="grid justify-items-start gap-2 text-sm">
                    <p className="text-red-600 dark:text-red-400">
                        {result.message}
                    </p>
                    <Button variant="outline" size="sm" onClick={retryRoute}>
                        Retry route
                    </Button>
                </div>
            ) : !metrics ? (
                <p className="text-sm text-muted-foreground">
                    Waiting for route calculation.
                </p>
            ) : null}
            <div className="grid gap-1 border-t border-gray-200 dark:border-gray-700 pt-3 text-sm">
                <h4 className="font-semibold">Trip travel totals</h4>
                <p>
                    {totals.calculatedDays
                        ? `${distance(totals.totalDistance)} · ${duration(totals.totalTime)}`
                        : "No route metrics available"}
                </p>
                <p className="text-xs text-muted-foreground">
                    {totals.requiredDays === 0
                        ? "Days with fewer than two stops do not need a travel route."
                        : `${totals.complete ? "Complete" : "Incomplete"}: ${totals.calculatedDays} of ${totals.requiredDays} daily routes calculated.`}{" "}
                    Travel only; visiting time is excluded.
                </p>
            </div>
        </section>
    );
}
