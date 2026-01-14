import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MapState {
    zoomLocationX: number;
    zoomLocationY: number;
    selectedPosition: number | null;
}

const initialState: MapState = {
    zoomLocationX: 52.083,
    zoomLocationY: 19.375,
    selectedPosition: null,
};

export const mapSlice = createSlice({
    name: "map",
    initialState,
    reducers: {
        setZoomLocationX: (state, action: PayloadAction<number>) => {
            state.zoomLocationX = action.payload;
        },
        setZoomLocationY: (state, action: PayloadAction<number>) => {
            state.zoomLocationY = action.payload;
        },
        setSelectedPosition: (state, action: PayloadAction<number | null>) => {
            state.selectedPosition = action.payload;
        },
    },
});

export const { setZoomLocationX, setZoomLocationY, setSelectedPosition } =
    mapSlice.actions;

export default mapSlice.reducer;
