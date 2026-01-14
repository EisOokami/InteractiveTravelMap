import { createSlice } from "@reduxjs/toolkit";

interface UIState {
    openSearch: boolean;
    openTrip: boolean;
    openPlaceDetails: boolean;
}

const initialState: UIState = {
    openSearch: false,
    openTrip: false,
    openPlaceDetails: false,
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setOpenSearch: (state, action) => {
            state.openSearch = action.payload;
        },
        setOpenTrip: (state, action) => {
            state.openTrip = action.payload;
        },
        setOpenPlaceDetails: (state, action) => {
            state.openPlaceDetails = action.payload;
        },
    },
});

export const { setOpenSearch, setOpenTrip, setOpenPlaceDetails } =
    uiSlice.actions;

export default uiSlice.reducer;
