import { combineReducers } from "@reduxjs/toolkit";
import mapReducer from "./features/map/mapSlice";
import routesReducer from "./features/routes/routesSlice";
import uiReducer from "./features/ui/uiSlice";
import favoritesReducer from "./features/favorites/favoritesSlice";
import datesReducer from "./features/dates/datesSlice";

export default combineReducers({
    map: mapReducer,
    routes: routesReducer,
    ui: uiReducer,
    favorites: favoritesReducer,
    dates: datesReducer,
});
