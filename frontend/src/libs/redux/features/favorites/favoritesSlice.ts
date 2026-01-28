import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FavoritesState {
    favorites: number[];
}

const initialState: FavoritesState = {
    favorites: [],
};

const favoritesSlice = createSlice({
    name: "favorites",
    initialState,
    reducers: {
        setFavorites: (state, action: PayloadAction<number[]>) => {
            state.favorites = action.payload;
        },
        toggleFavorite(state, action: PayloadAction<number>) {
            const id = action.payload;
            const exists = state.favorites.includes(id);

            if (exists) {
                state.favorites = state.favorites.filter(
                    (favorite) => favorite !== id,
                );
            } else {
                state.favorites.push(id);
            }
        },
    },
});

export const { setFavorites, toggleFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;
