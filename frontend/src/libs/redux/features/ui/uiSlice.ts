import { createSlice } from "@reduxjs/toolkit";

interface UIState {
    openSearch: boolean;
    openTrip: boolean;
    openFavorite: boolean;
    openPlaceDetails: boolean;
}

const initialState: UIState = {
    openSearch: false,
    openTrip: false,
    openFavorite: false,
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
        setOpenFavorite: (state, action) => {
            state.openFavorite = action.payload;
        },
        setOpenPlaceDetails: (state, action) => {
            state.openPlaceDetails = action.payload;
        },
    },
});

export const {
    setOpenSearch,
    setOpenTrip,
    setOpenFavorite,
    setOpenPlaceDetails,
} = uiSlice.actions;

export default uiSlice.reducer;
