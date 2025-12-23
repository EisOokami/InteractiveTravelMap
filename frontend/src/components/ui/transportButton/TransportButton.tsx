import { Dispatch, SetStateAction } from "react";
import { IconType } from "react-icons";

interface TransportButtonProps {
    id: string;
    transportMode: string;
    label: string;
    icon: IconType;
    setTransportMode: Dispatch<SetStateAction<string>>;
}

export default function TransportButton({
    id,
    transportMode,
    label,
    icon: Icon,
    setTransportMode,
}: TransportButtonProps) {
    return (
        <button
            type="button"
            onClick={() => setTransportMode(id)}
            className={`flex flex-col justify-center items-center gap-2 p-2 md:p-4 font-medium rounded-lg transition-all ${
                transportMode === id
                    ? "bg-bright-blue text-white shadow-lg scale-105"
                    : "bg-gray-100 dark:bg-dark-mode-black text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            }`}
        >
            <Icon className="w-5 md:w-6 h-5 md:h-6" />
            <span className="text-sm">{label}</span>
        </button>
    );
}
