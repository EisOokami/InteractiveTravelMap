import { Dispatch, SetStateAction } from "react";
import { IconType } from "react-icons";
import { Button } from "../shadcn/button";

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
        <Button
            onClick={() => setTransportMode(id)}
            className={`flex flex-col justify-center items-center gap-2 p-2 md:p-4 h-full font-medium rounded-lg transition-all [&_svg]:size-5 md:[&_svg]:size-6 ${
                transportMode === id
                    ? "bg-bright-blue text-white shadow-lg scale-105 hover:bg-bright-blue cursor-default"
                    : "bg-gray-100 dark:bg-dark-mode-black text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            }`}
        >
            <Icon />
            <span className="text-sm">{label}</span>
        </Button>
    );
}
