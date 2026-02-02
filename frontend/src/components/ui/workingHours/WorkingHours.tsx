import { IPosition } from "@/interfaces/interfaces";
import { WeekDays } from "@/types/types";

interface WorkingHoursProps {
    workingHours: IPosition["working_hours"];
}

export default function WorkingHours({
    workingHours,
}: Readonly<WorkingHoursProps>) {
    const getDayName = (key: WeekDays) => {
        const days: Record<WeekDays, string> = {
            mon: "Monday",
            tue: "Tuesday",
            wed: "Wednesday",
            thu: "Thursday",
            fri: "Friday",
            sat: "Saturday",
            sun: "Sunday",
        };
        return days[key] || key;
    };

    return (
        <div className="grid gap-2 p-4 bg-gray-50 dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-lg">
            {Object.entries(workingHours).map(([day, hours]) => (
                <div
                    key={day}
                    className="flex justify-between items-center text-sm"
                >
                    <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {getDayName(day as WeekDays)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                        {hours === "00:00-24:00" ? "Open 24 hours" : hours}
                    </span>
                </div>
            ))}
        </div>
    );
}
