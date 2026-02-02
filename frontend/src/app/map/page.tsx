import { getPlacesData } from "@/data/loaders";

import MapPageClient from "@/components/layout/mapPage/MapPage";

export default async function MapPage() {
    const placesData = await getPlacesData();

    return <MapPageClient placesData={placesData} />;
}
