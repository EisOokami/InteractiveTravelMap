import { IDate, IDateStorage, ISortedDate } from "@/interfaces/interfaces";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MapState {
    datesStorage: IDateStorage;
    sortedDates: ISortedDate[];
    dates: IDate[];
}

const initialState: MapState = {
    datesStorage: {},
    sortedDates: [],
    dates: [],
};

export const datesSlice = createSlice({
    name: "dates",
    initialState,
    reducers: {
        setDatesStorage: (state, action: PayloadAction<IDateStorage>) => {
            state.datesStorage = action.payload;
        },
        setSortedDates: (state, action: PayloadAction<ISortedDate[]>) => {
            state.sortedDates = action.payload;
        },
        setDates: (state, action: PayloadAction<IDate[]>) => {
            state.dates = action.payload;
        },
        updateDatesStorage: (
            state,
            action: PayloadAction<{ markerId: number; dates: IDate[] }>,
        ) => {
            const { markerId, dates } = action.payload;

            state.datesStorage = { ...state.datesStorage, [markerId]: dates };
        },
    },
});

export const { setDatesStorage, setSortedDates, setDates, updateDatesStorage } =
    datesSlice.actions;

export default datesSlice.reducer;
