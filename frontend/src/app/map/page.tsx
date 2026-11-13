import { getFavoritesData, getPlacesData, getUserData } from "@/data/loaders";

import MapPageClient from "@/components/layout/mapPage/MapPage";

export default async function MapPage() {
    const userData = await getUserData();
    const placesData = await getPlacesData();
    const favoritesData = await getFavoritesData();

    return (
        <MapPageClient
            placesData={placesData}
            userData={userData}
            favoritesData={favoritesData}
        />
    );
}
