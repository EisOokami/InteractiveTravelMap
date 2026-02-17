import { Request } from "express";
import { RowDataPacket } from "mysql2";

export interface IUser extends RowDataPacket {
    id: number;
    username: string;
    email: string;
    password: string;
    reset_token: string | null;
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
    user?: any;
}
