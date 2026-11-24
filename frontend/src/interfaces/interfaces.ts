import { TripsStore } from "./store";

export interface IDate {
    id: number;
    date: string;
    active: boolean;
}

export interface IDateStorage {
    [key: number]: IDate[] | undefined;
}

export interface IPlace {
    id: number;
    name: string;
    location: string;
    category: string;
    img: string;
    x: number | string | null;
    y: number | string | null;
    time: number;
    address: string;
    average_visit_duration: number;
    description_short: string;
    description_full: string;
    facilities: {
        parking: boolean;
        pet_friendly: boolean;
        wheelchair_access: boolean;
        wifi: boolean;
    };
    price: number;
    rating: number;
    working_hours: {
        fri: string;
        mon: string;
        sat: string;
        sun: string;
        thu: string;
        tue: string;
        wed: string;
    };
}

export interface IUserData {
    id: number;
    username: string;
    email: string;
    mfa_enabled: boolean;
    auth_provider: "local" | "google";
    requires_terms_acceptance?: boolean;
}

export interface IUserSession {
    id: string;
    ip: string | null;
    device: {
        type: string | null;
        vendor: string | null;
        model: string | null;
    };
    browser: { name: string | null; version: string | null };
    os: { name: string | null; version: string | null };
    createdAt: string;
    lastUsedAt: string;
    expiresAt: string;
    isCurrent: boolean;
}

export interface IUser {
    status: "success" | "error";
    message: string;
    data: IUserData | null;
}

export interface IRegister {
    username: string;
    password: string;
    email: string;
    acceptTerms: true;
    confirmAge: true;
}

export interface ILogin {
    email: string;
    password: string;
    acceptTerms?: boolean;
}

export interface IUpdateProfile {
    email: string;
    password: string;
}

export interface IForgotPassword {
    email: string;
}

export interface IResetPassword {
    token: string;
    password: string;
    id: number;
}

export interface RouteMetrics {
    totalDistance: number;
    totalTime: number;
}

export interface DayRoutePlan {
    key: string;
    points: [number, number][];
    issues: string[];
    stopCount: number;
}

export interface AnalysisSession {
    dispose: () => void;
    apply: (
        ids: number[],
    ) => ReturnType<TripsStore["reorderPlaces"]> | { ok: false; error: string };
}
