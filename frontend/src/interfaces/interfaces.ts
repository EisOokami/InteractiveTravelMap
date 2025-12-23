export interface IDates {
    id: number;
    date: string;
    active: boolean;
}

export interface IDatesStorage {
    [key: number]: IDates[];
}

export interface IPositions {
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

export interface ISortedDates {
    date: string;
    places: IPositions[];
}

export interface IRouteSegments {
    distance: string;
    time: string;
}

export interface IDatesMap {
    [key: string]: IPositions[];
}
