import { IconType } from "react-icons";
import { Badge } from "../shadcn/badge";

interface FacilityBadgeProps {
    icon: IconType;
    name: string;
}

export default function FacilityBadge({
    icon: Icon,
    name,
}: FacilityBadgeProps) {
    return (
        <Badge className="gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
            <Icon className="w-5 h-5" />
            <span className="text-sm font-medium">{name}</span>
        </Badge>
    );
}
