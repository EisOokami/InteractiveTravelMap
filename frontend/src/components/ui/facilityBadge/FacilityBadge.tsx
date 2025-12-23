import { IconType } from "react-icons";

interface FacilityBadgeProps {
    icon: IconType;
    name: string;
}

export default function FacilityBadge({
    icon: Icon,
    name,
}: FacilityBadgeProps) {
    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
            <Icon className="w-5 h-5" />
            <span className="text-sm font-medium">{name}</span>
        </div>
    );
}
