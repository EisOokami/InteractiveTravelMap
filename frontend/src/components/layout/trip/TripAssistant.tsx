"use client";

import { useEffect, useRef, useState } from "react";
import { KeyRound, LoaderCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/shadcn/select";
import type { AnalysisSession, IPlace } from "@/interfaces/interfaces";
import type { TripDay } from "@/interfaces/store";
import { useTripsStoreApi } from "@/libs/stores/tripsStoreProvider";
import { normalizeCoordinates, planDayRoute } from "@/libs/utils";
import {
    analysisSchema,
    geminiApiKeySchema,
} from "@/libs/validation/validation";
import z from "zod";
import { analyzeTripDay } from "@/data/actions";
import { geminiKeyStorageKey } from "@/libs/localData";

export default function TripAssistant({
    tripId,
    day,
    placesById,
    userId,
}: Readonly<{
    tripId: string;
    day: TripDay;
    placesById: Map<number, IPlace>;
    userId: number | null;
}>) {
    const store = useTripsStoreApi();
    const [apiKey, setApiKey] = useState<string>(() => {
        if (userId === null) {
            return "";
        }

        try {
            return (
                window.localStorage.getItem(geminiKeyStorageKey(userId)) ?? ""
            );
        } catch {
            return "";
        }
    });
    const [apiKeyInput, setApiKeyInput] = useState<string>("");
    const [apiKeyError, setApiKeyError] = useState<string>("");
    const [pace, setPace] = useState<
        "relaxed" | "balanced" | "intensive" | "none"
    >("none");
    const [instructions, setInstructions] = useState("");
    const [pending, setPending] = useState(false);
    const [analysis, setAnalysis] = useState<z.infer<
        typeof analysisSchema
    > | null>(null);
    const [message, setMessage] = useState("");
    const session = useRef<AnalysisSession | null>(null);

    useEffect(() => {
        return () => {
            session.current?.dispose();
            session.current = null;
        };
    }, []);

    const plan = planDayRoute(day, placesById);
    const unavailable =
        day.placeIds.length === 0
            ? "Add at least one stop to analyze this day."
            : day.placeIds.length > 15
              ? "AI analysis supports up to 15 stops per day."
              : plan.issues.length
                ? "All stops need valid place details and coordinates before analysis."
                : "";

    const handleSaveKey = () => {
        const validatedKey = geminiApiKeySchema.safeParse(apiKeyInput);

        if (!validatedKey.success || userId === null) {
            setApiKeyError("Enter a valid Gemini API key.");

            return;
        }

        try {
            window.localStorage.setItem(
                geminiKeyStorageKey(userId),
                validatedKey.data,
            );
        } catch {
            setApiKeyError(
                "The key could not be saved in this browser. Check that site data is allowed.",
            );

            return;
        }

        setApiKey(validatedKey.data);
        setApiKeyInput("");
        setApiKeyError("");
    };

    const handleRemoveKey = () => {
        setApiKeyError("");

        if (userId !== null) {
            try {
                window.localStorage.removeItem(geminiKeyStorageKey(userId));
            } catch {
                setApiKeyError("Failed to remove API key from local storage.");
            }
        }

        setApiKey("");
        setApiKeyInput("");
    };

    const handleAnalyze = async () => {
        if (unavailable || pending || !apiKey) {
            return;
        }

        const places = day.placeIds.flatMap((id) => {
            const place = placesById.get(id);
            const coordinates = place && normalizeCoordinates(place);

            if (!place || !coordinates) {
                return [];
            }

            return [
                {
                    id,
                    name: place.name,
                    latitude: coordinates[0],
                    longitude: coordinates[1],
                },
            ];
        });

        session.current?.dispose();

        let active = true;
        let unsubscribe: (() => void) | null = null;

        const matches = () => {
            const state = store.getState();

            return (
                state.selectedTripId === tripId &&
                state.selectedDay === day.date &&
                state.trips
                    .find((trip) => trip.id === tripId)
                    ?.days.find((item) => item.date === day.date) === day
            );
        };

        const isCurrent = () => active && matches();

        const dispose = () => {
            active = false;

            unsubscribe?.();
            unsubscribe = null;
        };

        unsubscribe = store.subscribe(() => {
            if (active && !matches()) {
                dispose();

                setPending(false);
                setAnalysis(null);
                setMessage(
                    "The day changed. Analyze it again for a fresh suggestion.",
                );
            }
        });

        const current: AnalysisSession = {
            dispose,
            apply: (ids) => {
                if (
                    !isCurrent() ||
                    !(
                        ids.length === day.placeIds.length &&
                        new Set(ids).size === day.placeIds.length &&
                        ids.every((id) => day.placeIds.includes(id))
                    )
                ) {
                    return {
                        ok: false as const,
                        error: "This suggestion is out of date. Analyze the day again.",
                    };
                }

                dispose();

                return store.getState().reorderPlaces(tripId, day.date, ids);
            },
        };

        const release = () => {
            dispose();

            if (session.current === current) {
                session.current = null;
            }
        };

        session.current = current;

        const route = store.getState().routeStates[plan.key];
        const metrics =
            route?.status === "ready" &&
            Number.isFinite(route.metrics.totalDistance) &&
            route.metrics.totalDistance >= 0 &&
            Number.isFinite(route.metrics.totalTime) &&
            route.metrics.totalTime >= 0
                ? route.metrics
                : null;

        setPending(true);
        setAnalysis(null);
        setMessage("");

        let succeeded = false;

        try {
            const result = await analyzeTripDay(
                {
                    day: day.date,
                    places,
                    travelMode: day.travelMode,
                    ...(metrics
                        ? {
                              routeMetrics: {
                                  distanceMeters: metrics.totalDistance,
                                  durationSeconds: metrics.totalTime,
                              },
                          }
                        : {}),
                    preferences: {
                        ...(pace !== "none" ? { pace } : {}),
                        instructions,
                    },
                },
                apiKey,
            );

            if (!isCurrent()) {
                return;
            }

            if (!result.ok || !result.analysis) {
                toast.error("Error", { description: result.message });

                return;
            }

            setAnalysis(result.analysis);

            succeeded = true;
        } catch {
            if (isCurrent()) {
                toast.error("Error", {
                    description: "AI analysis failed. Please try again later.",
                });
            }
        } finally {
            if (isCurrent()) {
                setPending(false);

                if (!succeeded) {
                    release();
                }
            }
        }
    };

    const handleApply = () => {
        if (!analysis || !session.current) {
            return;
        }

        const result = session.current.apply(analysis.suggestedPlaceIds);

        session.current?.dispose();
        session.current = null;

        setPending(false);
        setAnalysis(null);

        if (!result.ok) {
            setMessage(result.error);

            return;
        }

        setMessage(
            "Suggestion applied. Actual route statistics are shown above once Mapbox finishes.",
        );

        toast.success("Suggested stop order applied");
    };

    const sameOrder = analysis?.suggestedPlaceIds.every(
        (id, index) => id === day.placeIds[index],
    );

    return (
        <section className="grid gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <h3
                id="trip-assistant-title"
                className="flex items-center gap-2 font-semibold"
            >
                <Sparkles className="size-4" />
                AI Trip Assistant
            </h3>
            <p className="text-xs text-muted-foreground">
                Sends stops and preferences for this day to Gemini with your own
                Gemini API key. Review the proposal before applying it. Mapbox
                provides actual route metrics.
            </p>
            <div className="grid gap-2 rounded-md bg-gray-50 p-2 dark:bg-gray-800/60">
                {apiKey ? (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="flex items-center gap-2 text-sm">
                            <KeyRound className="size-4" />
                            Your Gemini API key is saved in this browser (...
                            {apiKey.slice(-4)})
                        </p>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleRemoveKey}
                            disabled={pending}
                        >
                            Remove key
                        </Button>
                    </div>
                ) : (
                    <>
                        <Label htmlFor="ai-api-key">Your Gemini API key</Label>
                        <div className="flex gap-2">
                            <Input
                                id="ai-api-key"
                                type="password"
                                value={apiKeyInput}
                                onChange={(event) =>
                                    setApiKeyInput(event.target.value)
                                }
                                maxLength={200}
                                autoComplete="off"
                                spellCheck={false}
                            />
                            <Button
                                size="sm"
                                onClick={handleSaveKey}
                                disabled={!apiKeyInput.trim()}
                            >
                                Save
                            </Button>
                        </div>
                        {apiKeyError && (
                            <p className="text-xs text-red-500">
                                {apiKeyError}
                            </p>
                        )}
                    </>
                )}
                <p
                    id="ai-api-key-info"
                    className="text-xs text-muted-foreground"
                >
                    The key is stored only in this browser and is removed when
                    you delete your account. With each analysis it is passed
                    through our server to Google and is not saved or logged
                    there. Requests made with your key are covered by your own
                    agreement with Google:{" "}
                    <a
                        href="https://ai.google.dev/gemini-api/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                    >
                        Gemini API Terms
                    </a>
                    .{" "}
                    <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                    >
                        Get a key
                    </a>
                </p>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="ai-pace">Travel pace (optional)</Label>
                <Select
                    value={pace}
                    onValueChange={(value) =>
                        setPace(
                            value as
                                | "relaxed"
                                | "balanced"
                                | "intensive"
                                | "none",
                        )
                    }
                    disabled={pending}
                >
                    <SelectTrigger id="ai-pace">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[2202]">
                        <SelectItem value="none">No preference</SelectItem>
                        <SelectItem value="relaxed">Relaxed</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="intensive">Intensive</SelectItem>
                    </SelectContent>
                </Select>
                <Label htmlFor="ai-instructions">
                    Additional instructions (optional)
                </Label>
                <Input
                    id="ai-instructions"
                    value={instructions}
                    onChange={(event) => setInstructions(event.target.value)}
                    maxLength={300}
                    disabled={pending}
                    placeholder="For example: prefer a relaxed afternoon"
                />
                <p
                    id="ai-instructions-count"
                    className="text-xs text-muted-foreground"
                >
                    {instructions.length}/300 characters. Do not enter personal
                    data (names, contact details, health information).
                </p>
            </div>
            {unavailable && (
                <p className="text-sm text-muted-foreground">{unavailable}</p>
            )}
            <div className="flex flex-wrap gap-2">
                <Button
                    size="sm"
                    onClick={handleAnalyze}
                    disabled={pending || !!unavailable || !apiKey}
                >
                    {pending ? (
                        <LoaderCircle className="mr-2 size-4 animate-spin" />
                    ) : (
                        <Sparkles className="mr-2 size-4" />
                    )}
                    {pending ? "Analyzing..." : "Analyze with AI"}
                </Button>
                {(pending || analysis || message) && (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                            session.current?.dispose();
                            session.current = null;

                            setPending(false);
                            setAnalysis(null);
                            setMessage("");
                        }}
                    >
                        Dismiss
                    </Button>
                )}
            </div>
            {message && <p className="text-sm">{message}</p>}
            {analysis && (
                <div className="grid gap-3 text-sm">
                    <p>{analysis.summary}</p>
                    <div>
                        <h4 className="font-medium">Suggested stop order</h4>
                        <ol className="list-inside list-decimal space-y-1">
                            {analysis.suggestedPlaceIds.map((id) => (
                                <li key={id}>
                                    {placesById.get(id)?.name ?? `Place #${id}`}
                                </li>
                            ))}
                        </ol>
                    </div>
                    <ul className="list-inside list-disc space-y-1">
                        {analysis.recommendations.map((item, index) => (
                            <li key={index}>{item.message}</li>
                        ))}
                    </ul>
                    {analysis.warnings.length > 0 && (
                        <div className="rounded-md bg-amber-50 p-2 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                            <h4 className="font-medium">Warnings</h4>
                            <ul className="list-inside list-disc">
                                {analysis.warnings.map((warning, index) => (
                                    <li key={index}>{warning}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {sameOrder && (
                        <p className="text-muted-foreground">
                            The suggested order matches your current stops.
                        </p>
                    )}
                    <Button
                        size="sm"
                        className="justify-self-start"
                        onClick={handleApply}
                        disabled={sameOrder}
                    >
                        Apply Suggestion
                    </Button>
                </div>
            )}
        </section>
    );
}
