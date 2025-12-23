import { getPositionsData } from "@/data/loaders";

import MapPage from "@/components/layout/mapPage/MapPage";

export default async function HomePage() {
    const positionsData = await getPositionsData();

    return <MapPage positionsData={positionsData} />;
}
