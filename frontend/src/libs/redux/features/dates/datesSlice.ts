import { IDates, IDatesStorage, ISortedDates } from "@/interfaces/interfaces";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MapState {
    datesStorage: IDatesStorage;
    sortedDates: ISortedDates[];
    dates: IDates[];
}

const initialState: MapState = {
    datesStorage: {},
    sortedDates: [],
    dates: [],
};

export const datesSlice = createSlice({
    name: "map",
    initialState,
    reducers: {
        setDatesStorage: (state, action: PayloadAction<IDatesStorage>) => {
            state.datesStorage = action.payload;
        },
        setSortedDates: (state, action: PayloadAction<ISortedDates[]>) => {
            state.sortedDates = action.payload;
        },
        setDates: (state, action: PayloadAction<IDates[]>) => {
            state.dates = action.payload;
        },
        updateDatesStorage: (
            state,
            action: PayloadAction<{ markerId: number; dates: IDates[] }>,
        ) => {
            const { markerId, dates } = action.payload;

            state.datesStorage = { ...state.datesStorage, [markerId]: dates };
        },
    },
});

export const { setDatesStorage, setSortedDates, setDates, updateDatesStorage } =
    datesSlice.actions;

export default datesSlice.reducer;
