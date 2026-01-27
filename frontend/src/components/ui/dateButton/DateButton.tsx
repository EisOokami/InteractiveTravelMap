import { IDate } from "@/interfaces/interfaces";
import { Button } from "../shadcn/button";

interface DateButtonProps {
    id: number;
    date: string;
    active: boolean;
    dates: IDate[];
    setDates: (value: IDate[]) => void;
    updateDatesStorage: (value: { markerId: number; dates: IDate[] }) => void;
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
        updateDatesStorage({ markerId: positionId, dates: updatedDates });
    };

    return (
        <Button
            className={`h-14 text-white hover:bg-blue-600 rounded-lg transition ${
                active ? "bg-blue-600 shadow-lg scale-105" : "bg-bright-blue"
            }`}
            onClick={() => handleActivateDate(id)}
        >
            <span className="text-sm sm:text-base md:text-lg font-semibold">
                {date}
            </span>
        </Button>
    );
}
