import { Dispatch, SetStateAction } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import app from "./firebaseConfig";
import { IPositions } from "@/interfaces/interfaces";

export const fetchPositions = (
    setPositions: Dispatch<SetStateAction<IPositions[]>>,
    setLoading: Dispatch<SetStateAction<boolean>>,
) => {
    const database = getDatabase(app);
    const dbRef = ref(database, "positions");

    onValue(dbRef, (snapshot) => {
        setLoading(true);

        const data = snapshot.val();

        if (data) {
            const positionsData: IPositions[] = Object.values(data);

            setLoading(false);
            setPositions(positionsData);
        }
    });
};
