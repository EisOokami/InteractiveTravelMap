"use client";

import { Dispatch, memo, SetStateAction, useCallback } from "react";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import { FaPersonHiking } from "react-icons/fa6";
import styles from "./Sidebar.module.scss";

interface NavbarProps {
    openSearch: boolean;
    setOpenSearch: Dispatch<SetStateAction<boolean>>;
    setOpenPlaceDetails: Dispatch<SetStateAction<boolean>>;
    openTrip: boolean;
    setOpenTrip: Dispatch<SetStateAction<boolean>>;
    setZoomLocationX: Dispatch<SetStateAction<number>>;
    setZoomLocationY: Dispatch<SetStateAction<number>>;
}

const Navbar = memo(function Navbar({
    openSearch,
    setOpenSearch,
    setOpenPlaceDetails,
    openTrip,
    setOpenTrip,
    setZoomLocationX,
    setZoomLocationY,
}: NavbarProps) {
    const handleOpenMap = useCallback(() => {
        setOpenSearch(false);
        setOpenPlaceDetails(false);
        setOpenTrip(false);
        setZoomLocationX(52.083);
        setZoomLocationY(19.375);
    }, [
        setOpenSearch,
        setOpenPlaceDetails,
        setOpenTrip,
        setZoomLocationX,
        setZoomLocationY,
    ]);

    const handleOpenSearch = useCallback(() => {
        setOpenSearch(!openSearch);
        setOpenPlaceDetails(false);
        setOpenTrip(false);
        setZoomLocationX(52.083);
        setZoomLocationY(19.375);
    }, [
        openSearch,
        setOpenPlaceDetails,
        setOpenTrip,
        setOpenSearch,
        setZoomLocationX,
        setZoomLocationY,
    ]);

    const handleOpenTrip = useCallback(() => {
        setOpenSearch(false);
        setOpenPlaceDetails(false);
        setOpenTrip(!openTrip);
        setZoomLocationX(52.083);
        setZoomLocationY(19.375);
    }, [
        openTrip,
        setOpenSearch,
        setOpenPlaceDetails,
        setOpenTrip,
        setZoomLocationX,
        setZoomLocationY,
    ]);

    const styleIsActiveMap =
        !openSearch && !openTrip
            ? styles["sidebar__option--active"]
            : "border-white dark:border-dark-mode-black";
    const styleIsActiveSearch = openSearch
        ? styles["sidebar__option--active"]
        : "border-white dark:border-dark-mode-black";
    const styleIsActiveTrip = openTrip
        ? styles["sidebar__option--active"]
        : "border-white dark:border-dark-mode-black";

    return (
        <nav className="md:grid font-mono bg-white dark:bg-dark-mode-black border-t-2 border-b-2 md:border-t-0 md:border-b-0 md:border-r-2 dark:border-dark-mode-gray-2 z-1999 transition">
            <ul className="flex md:flex-col justify-around md:justify-center">
                <li
                    className={`${styles.sidebar__option} ${styleIsActiveMap}`}
                    onClick={handleOpenMap}
                >
                    <FaMapMarkerAlt />
                    <div
                        className={styles["sidebar__option--bg-gradient"]}
                    ></div>
                </li>
                <li
                    className={`${styles.sidebar__option} ${styleIsActiveSearch}`}
                    onClick={handleOpenSearch}
                >
                    <FaSearch />
                    <div
                        className={styles["sidebar__option--bg-gradient"]}
                    ></div>
                </li>
                <li
                    className={`${styles.sidebar__option} ${styleIsActiveTrip}`}
                    onClick={handleOpenTrip}
                >
                    <FaPersonHiking />
                    <div
                        className={styles["sidebar__option--bg-gradient"]}
                    ></div>
                </li>
            </ul>
        </nav>
    );
});

export default Navbar;
