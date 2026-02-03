"use client";

import { Bookmark, Map, Route, Search } from "lucide-react";
import styles from "./Sidebar.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/libs/redux/store";
import {
    setOpenFavorite,
    setOpenPlaceDetails,
    setOpenSearch,
    setOpenTrip,
} from "@/libs/redux/features/ui/uiSlice";
import {
    setZoomLocationX,
    setZoomLocationY,
} from "@/libs/redux/features/map/mapSlice";

export default function Sidebar() {
    const openSearch = useSelector((state: RootState) => state.ui.openSearch);
    const openTrip = useSelector((state: RootState) => state.ui.openTrip);
    const openFavorite = useSelector(
        (state: RootState) => state.ui.openFavorite,
    );
    const openPlaceDetails = useSelector(
        (state: RootState) => state.ui.openPlaceDetails,
    );
    const dispatch = useDispatch();

    const handleOpenMap = () => {
        dispatch(setOpenSearch(false));
        dispatch(setOpenPlaceDetails(false));
        dispatch(setOpenTrip(false));
        dispatch(setOpenFavorite(false));
        dispatch(setZoomLocationX(52.083));
        dispatch(setZoomLocationY(19.375));
    };

    const handleOpenSearch = () => {
        if (openSearch && openPlaceDetails) {
            dispatch(setOpenPlaceDetails(false));
            dispatch(setZoomLocationX(52.083));
            dispatch(setZoomLocationY(19.375));

            return;
        }

        dispatch(setOpenSearch(!openSearch));
        dispatch(setOpenPlaceDetails(false));
        dispatch(setOpenTrip(false));
        dispatch(setOpenFavorite(false));
        dispatch(setZoomLocationX(52.083));
        dispatch(setZoomLocationY(19.375));
    };

    const handleOpenTrip = () => {
        dispatch(setOpenSearch(false));
        dispatch(setOpenPlaceDetails(false));
        dispatch(setOpenTrip(!openTrip));
        dispatch(setOpenFavorite(false));
        dispatch(setZoomLocationX(52.083));
        dispatch(setZoomLocationY(19.375));
    };

    const handleOpenFavorite = () => {
        if (openFavorite && openPlaceDetails) {
            dispatch(setOpenPlaceDetails(false));
            dispatch(setZoomLocationX(52.083));
            dispatch(setZoomLocationY(19.375));

            return;
        }

        dispatch(setOpenSearch(false));
        dispatch(setOpenPlaceDetails(false));
        dispatch(setOpenTrip(false));
        dispatch(setOpenFavorite(!openFavorite));
        dispatch(setZoomLocationX(52.083));
        dispatch(setZoomLocationY(19.375));
    };

    const styleIsActiveMap =
        !openSearch && !openTrip && !openFavorite
            ? styles["sidebar__option--active"]
            : "border-white dark:border-dark-mode-black";
    const styleIsActiveSearch = openSearch
        ? styles["sidebar__option--active"]
        : "border-white dark:border-dark-mode-black";
    const styleIsActiveTrip = openTrip
        ? styles["sidebar__option--active"]
        : "border-white dark:border-dark-mode-black";
    const styleIsActiveFavorite = openFavorite
        ? styles["sidebar__option--active"]
        : "border-white dark:border-dark-mode-black";

    return (
        <nav className="md:grid font-mono bg-white dark:bg-dark-mode-black border-t-2 border-b-2 md:border-t-0 md:border-b-0 md:border-r-2 dark:border-dark-mode-gray-2 z-1999 transition">
            <ul className="flex md:flex-col justify-around md:justify-center">
                <li
                    className={`${styles.sidebar__option} ${styleIsActiveMap}`}
                    onClick={handleOpenMap}
                >
                    <Map />
                    <div
                        className={styles["sidebar__option--bg-gradient"]}
                    ></div>
                </li>
                <li
                    className={`${styles.sidebar__option} ${styleIsActiveSearch}`}
                    onClick={handleOpenSearch}
                >
                    <Search />
                    <div
                        className={styles["sidebar__option--bg-gradient"]}
                    ></div>
                </li>
                <li
                    className={`${styles.sidebar__option} ${styleIsActiveTrip}`}
                    onClick={handleOpenTrip}
                >
                    <Route />
                    <div
                        className={styles["sidebar__option--bg-gradient"]}
                    ></div>
                </li>
                <li
                    className={`${styles.sidebar__option} ${styleIsActiveFavorite}`}
                    onClick={handleOpenFavorite}
                >
                    <Bookmark />
                    <div
                        className={styles["sidebar__option--bg-gradient"]}
                    ></div>
                </li>
            </ul>
        </nav>
    );
}
