export interface IDate {
    id: number;
    date: string;
    active: boolean;
}

export interface IDateStorage {
    [key: number]: IDate[];
}

export interface IPlace {
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

export interface ISortedDate {
    date: string;
    places: IPlace[];
}

export interface IRouteSegment {
    distance: string;
    time: string;
}

export interface IDateMap {
    [key: string]: IPlace[];
}
