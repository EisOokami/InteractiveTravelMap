import { LucideIcon } from "lucide-react";

interface InfoCardProps {
    icon: LucideIcon;
    title: string;
    info: string;
}

export default function InfoCard({ icon: Icon, title, info }: InfoCardProps) {
    return (
        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-lg transition-colors">
            <Icon className="w-6 h-6 text-bright-blue" />
            <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    {title}
                </p>
                <p className="font-semibold text-black dark:text-white">
                    {info}
                </p>
            </div>
        </div>
    );
}
