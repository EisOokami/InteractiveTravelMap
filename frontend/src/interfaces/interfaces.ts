export interface IDate {
    id: number;
    date: string;
    active: boolean;
}

export interface IDateStorage {
    [key: number]: IDate[];
}

export interface IPosition {
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
        parking: true;
        pet_friendly: true;
        wheelchair_access: false;
        wifi: false;
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
    places: IPosition[];
}

export interface IRouteSegment {
    distance: string;
    time: string;
}

export interface IDateMap {
    [key: string]: IPosition[];
}
