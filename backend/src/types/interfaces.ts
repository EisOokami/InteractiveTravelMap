import { RowDataPacket } from "mysql2";

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
