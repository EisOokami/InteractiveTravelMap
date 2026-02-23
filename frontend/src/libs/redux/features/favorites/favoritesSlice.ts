import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    addItemToFavoriteAction,
    removeItemFromFavoriteAction,
} from "@/data/actions";
import { IPlace } from "@/interfaces/interfaces";
import { toast } from "sonner";

interface FavoritesState {
    favorites: IPlace[];
    loading: boolean;
    error: string | null;
}

const initialState: FavoritesState = {
    favorites: [],
    loading: false,
    error: null,
};

export const toggleFavoriteAsync = createAsyncThunk<
    { place: IPlace; ok: boolean; message: string },
    IPlace,
    { rejectValue: string; state: { favorites: FavoritesState } }
>("favorites/toggleFavorite", async (place, { rejectWithValue, getState }) => {
    const { favorites } = getState().favorites;

    const isFavorite = favorites.some((favorite) => favorite.id === place.id);

    const result = isFavorite
        ? await removeItemFromFavoriteAction(place.id)
        : await addItemToFavoriteAction(place.id);

    if (!result || !result.ok) {
        return rejectWithValue(result?.message || "Something went wrong");
    }

    return { place, ok: true, message: result.message };
});

const favoritesSlice = createSlice({
    name: "favorites",
    initialState,
    reducers: {
        setFavorites: (state, action: PayloadAction<IPlace[]>) => {
            state.favorites = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(toggleFavoriteAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(toggleFavoriteAsync.fulfilled, (state, action) => {
                state.loading = false;

                const place = action.payload.place;
                const index = state.favorites.findIndex(
                    (p) => p.id === place.id,
                );

                if (index !== -1) {
                    state.favorites.splice(index, 1);

                    toast.success("Removed from favorites", {
                        description: `${place.name || "Place"} has been removed from your favorites`,
                    });
                } else {
                    state.favorites.push(place);

                    toast.success("Added to favorites", {
                        description: `${place.name || "Place"} has been added to your favorites`,
                    });
                }
            })
            .addCase(toggleFavoriteAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to add to favorites";

                toast.error("Error", {
                    description: action.payload || "Failed to update favorites",
                });
            });
    },
});

export const { setFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;
