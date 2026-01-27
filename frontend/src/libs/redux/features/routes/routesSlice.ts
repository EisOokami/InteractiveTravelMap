import { IRouteSegment } from "@/interfaces/interfaces";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Routing } from "leaflet";

interface RoutesState {
    showRoute: boolean;
    transportMode: string;
    routeSegments: IRouteSegment[];
    routingControl: Routing.Control | null;
}

const initialState: RoutesState = {
    showRoute: false,
    transportMode: "car",
    routeSegments: [],
    routingControl: null,
};

const routesSlice = createSlice({
    name: "routes",
    initialState,
    reducers: {
        setShowRoute: (state, action: PayloadAction<boolean>) => {
            state.showRoute = action.payload;
        },
        setTransportMode: (state, action: PayloadAction<string>) => {
            state.transportMode = action.payload;
        },
        setRouteSegments: (state, action: PayloadAction<IRouteSegment[]>) => {
            state.routeSegments = action.payload;
        },
        setRoutingControl: (
            state,
            action: PayloadAction<Routing.Control | null>,
        ) => {
            state.routingControl = action.payload;
        },
    },
});

export const {
    setShowRoute,
    setTransportMode,
    setRouteSegments,
    setRoutingControl,
} = routesSlice.actions;

export default routesSlice.reducer;
