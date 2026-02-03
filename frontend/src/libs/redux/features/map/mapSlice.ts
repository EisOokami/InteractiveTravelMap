import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MapState {
    zoomLocationX: number;
    zoomLocationY: number;
}

const initialState: MapState = {
    zoomLocationX: 52.083,
    zoomLocationY: 19.375,
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
    },
});

export const { setZoomLocationX, setZoomLocationY } = mapSlice.actions;

export default mapSlice.reducer;
