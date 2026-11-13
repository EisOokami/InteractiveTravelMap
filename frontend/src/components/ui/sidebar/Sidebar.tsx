"use client";

import { useMapStore } from "@/libs/stores/mapStoreProvider";
import { Bookmark, Map, Route, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { IUser } from "@/interfaces/interfaces";
import styles from "./Sidebar.module.scss";

const Profile = dynamic(() => import("@/components/ui/profile/Profile"), {
    loading: () => (
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full z-50 animate-pulse"></div>
    ),
    ssr: false,
});

interface SidebarProps {
    userData?: IUser;
}

export default function Sidebar({ userData }: Readonly<SidebarProps>) {
    const setIsPlaceDetailsLoading = useMapStore(
        (state) => state.setIsPlaceDetailsLoading,
    );
    const setOpenFavorite = useMapStore((state) => state.setOpenFavorite);
    const setOpenPlaceDetails = useMapStore(
        (state) => state.setOpenPlaceDetails,
    );
    const setOpenSearch = useMapStore((state) => state.setOpenSearch);
    const setOpenTrip = useMapStore((state) => state.setOpenTrip);
    const setZoomLocationX = useMapStore((state) => state.setZoomLocationX);
    const setZoomLocationY = useMapStore((state) => state.setZoomLocationY);
    const openSearch = useMapStore((state) => state.ui.openSearch);
    const openTrip = useMapStore((state) => state.ui.openTrip);
    const openFavorite = useMapStore((state) => state.ui.openFavorite);
    const openPlaceDetails = useMapStore((state) => state.ui.openPlaceDetails);
    const pathname = usePathname();
    const router = useRouter();

    const handleOpenMap = () => {
        setOpenSearch(false);
        setOpenPlaceDetails(false);
        setOpenTrip(false);
        setOpenFavorite(false);
        setZoomLocationX(52.083);
        setZoomLocationY(19.375);
        setIsPlaceDetailsLoading(true);

        router.push(pathname);
    };

    const handleOpenSearch = () => {
        if (openSearch && openPlaceDetails) {
            setOpenPlaceDetails(false);
            setZoomLocationX(52.083);
            setZoomLocationY(19.375);
            setIsPlaceDetailsLoading(true);

            router.push(pathname);

            return;
        }

        setOpenSearch(!openSearch);
        setOpenPlaceDetails(false);
        setOpenTrip(false);
        setOpenFavorite(false);
        setZoomLocationX(52.083);
        setZoomLocationY(19.375);
        setIsPlaceDetailsLoading(true);

        router.push(pathname);
    };

    const handleOpenTrip = () => {
        setOpenSearch(false);
        setOpenPlaceDetails(false);
        setOpenTrip(!openTrip);
        setOpenFavorite(false);
        setZoomLocationX(52.083);
        setZoomLocationY(19.375);
        setIsPlaceDetailsLoading(true);

        router.push(pathname);
    };

    const handleOpenFavorite = () => {
        if (openFavorite && openPlaceDetails) {
            setOpenPlaceDetails(false);
            setZoomLocationX(52.083);
            setZoomLocationY(19.375);
            setIsPlaceDetailsLoading(true);

            router.push(pathname);

            return;
        }

        setOpenSearch(false);
        setOpenPlaceDetails(false);
        setOpenTrip(false);
        setOpenFavorite(!openFavorite);
        setZoomLocationX(52.083);
        setZoomLocationY(19.375);
        setIsPlaceDetailsLoading(true);

        router.push(pathname);
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
        <nav className="md:flex flex-col items-center md:py-5 font-mono bg-white dark:bg-dark-mode-black border-t-2 border-b-2 md:border-t-0 md:border-b-0 md:border-r-2 dark:border-dark-mode-gray-2 z-30 transition">
            <ul className="flex md:flex-col justify-around md:justify-center h-full">
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
            <div className="hidden md:block">
                <Profile userData={userData} />
            </div>
        </nav>
    );
}
