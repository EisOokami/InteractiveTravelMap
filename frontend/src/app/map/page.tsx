import { getPlacesData, getUserData } from "@/data/loaders";

import MapPageClient from "@/components/layout/mapPage/MapPage";
import CookieRefresher from "@/components/layout/cookieRefresher/CookieRefresher";

export default async function MapPage() {
    const userData = await getUserData();
    const placesData = await getPlacesData();

    return (
        <CookieRefresher status={userData.status === "error" ? 401 : 200}>
            <MapPageClient
                placesData={placesData}
                userData={userData}
            />
        </CookieRefresher>
    );
}
