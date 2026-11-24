import { cookies } from "next/headers";
import { getFavoritesData, getPlacesData, getUserData } from "@/data/loaders";

import MapPageClient from "@/components/layout/mapPage/MapPage";
import DeletedAccountCleanup from "@/components/layout/deletedAccountCleanup/DeletedAccountCleanup";

export default async function MapPage() {
    const userData = await getUserData();
    const placesData = await getPlacesData();
    const favoritesData = await getFavoritesData();
    const cookieStore = await cookies();
    const deletedAccountId = Number(cookieStore.get("deletedAccountId")?.value);

    return (
        <>
            {Number.isSafeInteger(deletedAccountId) && deletedAccountId > 0 && (
                <DeletedAccountCleanup
                    key={deletedAccountId}
                    userId={deletedAccountId}
                />
            )}
            <MapPageClient
                placesData={placesData}
                userData={userData}
                favoritesData={favoritesData}
            />
        </>
    );
}
