import { combineReducers } from "@reduxjs/toolkit";
import mapReducer from "./features/map/mapSlice";
import routesReducer from "./features/routes/routesSlice";
import uiReducer from "./features/ui/uiSlice";
import datesReducer from "./features/dates/datesSlice";

export default combineReducers({
    map: mapReducer,
    routes: routesReducer,
    ui: uiReducer,
    dates: datesReducer,
});
