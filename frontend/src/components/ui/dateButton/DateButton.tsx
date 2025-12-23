import { IDates } from "@/interfaces/interfaces";
import { Dispatch, SetStateAction } from "react";

interface DateButtonProps {
    id: number;
    date: string;
    active: boolean;
    dates: IDates[];
    setDates: Dispatch<SetStateAction<IDates[]>>;
    updateDatesStorage: (markerId: number, dates: IDates[]) => void;
    positionId: number;
}

export default function DateButton({
    id,
    active,
    date,
    dates,
    setDates,
    updateDatesStorage,
    positionId,
}: DateButtonProps) {
    const handleActivateDate = (id: number) => {
        const updatedDates = dates.map((dateObj) => {
            if (dateObj.id === id) {
                return { ...dateObj, active: !dateObj.active };
            }
            return dateObj;
        });

        setDates(updatedDates);
        updateDatesStorage(positionId, updatedDates);
    };

    return (
        <button
            className={`flex justify-center items-center h-14 text-white rounded-lg transition ${
                active
                    ? "bg-blue-600 shadow-lg scale-105"
                    : "bg-bright-blue hover:bg-blue-600"
            }`}
            onClick={() => handleActivateDate(id)}
        >
            <span className="text-sm sm:text-base md:text-lg font-semibold">
                {date}
            </span>
        </button>
    );
}
