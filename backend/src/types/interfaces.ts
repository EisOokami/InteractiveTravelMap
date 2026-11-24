import { Request } from "express";
import { RowDataPacket } from "mysql2";

declare module "express-serve-static-core" {
    interface Request {
        user: { id: number; sid: string };
    }
}

export interface IUser extends RowDataPacket {
    id: number;
    username: string;
    email: string;
    password: string | null;
    google_id: string | null;
    auth_provider: "local" | "google";
    reset_token: string | null;
    mfa_enabled: boolean;
    mfa_secret: Buffer | null;
    mfa_enabled_at: string | null;
    is_verified: boolean;
    verification_token: string | null;
    verification_token_expires: string | null;
    terms_accepted_at: string;
    terms_version: string;
    privacy_accepted_at: string;
    privacy_version: string;
    pending_email: string | null;
    email_change_stage: "current" | "new" | null;
    email_change_token_hash: string | null;
    email_change_expires_at: string | null;
}

export interface IFacilities extends RowDataPacket {
    parking: number;
    pet_friendly: number;
    wheelchair_access: number;
    wifi: number;
}

export interface IWorkingHours extends RowDataPacket {
    mon: string;
    tue: string;
    wed: string;
    thu: string;
    fri: string;
    sat: string;
    sun: string;
}

export interface IPlace extends RowDataPacket {
    id: number;
    name: string;
    location: string;
    category: string;
    img: string;
    x: number;
    y: number;
    time: number;
    address: string;
    average_visit_duration: number;
    description_short: string;
    description_full: string;
    facilities: string;
    price: string;
    rating: number;
    working_hours: string;
}

export interface IFavorite extends RowDataPacket {
    user: IUser;
    place: IPlace;
}

export interface IGetUserRequest extends Request {
    user: { id: number; sid: string };
}

export interface IRefreshSession extends RowDataPacket {
    id: string;
    user_id: number;
    refresh_token_hash: string;
    revoked: boolean;
    expires_at: string;
    replaced_by: string | null;
    replaced_at: string | null;
    ip: string | null;
    user_agent: string | null;
    created_at: string;
    last_used_at: string;
}

export interface IMfaLoginSession extends RowDataPacket {
    id: string;
    token_hash: string;
    user_id: number;
    ip_address: string | null;
    user_agent: string | null;
    attempts: number;
    expires_at: string;
    created_at: string;
}

export interface IMfaBackupCode extends RowDataPacket {
    id: string;
    user_id: number;
    code_hash: string;
    used_at: string | null;
    created_at: string;
}

export interface ILoginEmailCodes extends RowDataPacket {
    id: number;
    token_hash: string;
    user_id: number;
    code_hash: string;
    attempts: number;
    ip_address: string;
    user_agent: string;
    last_sent_at: string | null;
    expires_at: string;
    created_at: string;
}

export interface IGoogleProfile {
    googleId: string;
    email: string;
    emailVerified: boolean;
    name: string;
}

export interface IAccountDeletionSession extends RowDataPacket {
    id: number;
    token_hash: string;
    user_id: number;
    method: "totp" | "email";
    code_hash: string;
    attempts: number;
    last_sent_at: string;
    expires_at: string;
    created_at: string;
}

export type AuditReason =
    | "suspicious_query"
    | "suspicious_body"
    | "suspicious_path"
    | "suspicious_user_agent"
    | "rate_limit_exceeded"
    | "not_found";

export interface IRequestWithAuditFlag extends Request {
    flaggedSuspicious?: boolean;
}
