import { getPositionsData } from "@/data/loaders";

import MapPageClient from "@/components/layout/mapPage/MapPage";

export default async function MapPage() {
    const positionsData = await getPositionsData();

    return <MapPageClient positionsData={positionsData} />;
}
