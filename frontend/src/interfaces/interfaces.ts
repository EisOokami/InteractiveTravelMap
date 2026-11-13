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
    // MySQL DECIMAL values can arrive as strings; normalize before map use.
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
}

export interface ILogin {
    email: string;
    password: string;
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
