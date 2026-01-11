import { Dispatch, SetStateAction } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "../shadcn/select";

interface CategoryDropdownProps {
    uniqueCategories: string[];
    selectedCategory: string;
    setSelectedCategory: Dispatch<SetStateAction<string>>;
}

export default function CategoryDropdown({
    uniqueCategories,
    selectedCategory,
    setSelectedCategory,
}: CategoryDropdownProps) {
    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
    };

    return (
        <Select
            value={selectedCategory}
            onValueChange={(value) => handleCategoryChange(value)}
        >
            <SelectTrigger
                iconClassName="w-6 h-6"
                className="flex items-center justify-between w-full px-4 py-2 md:py-6 !text-white font-medium bg-bright-blue hover:bg-blue-600 rounded-lg transition"
            >
                <SelectValue placeholder="Select categories" />
            </SelectTrigger>
            <SelectContent className="z-[1005]">
                <SelectItem value="all">All categories</SelectItem>
                <SelectSeparator />
                {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                        {category}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
