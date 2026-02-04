"use client";

import {
    useState,
    useMemo,
    Dispatch,
    SetStateAction,
    useCallback,
} from "react";
import { z } from "zod";
import {
    ArrowUpDown,
    DollarSign,
    Search,
    SlidersHorizontal,
    Star,
    TextQuote,
} from "lucide-react";
import { IPlace } from "@/interfaces/interfaces";
import { FacilityKeys, SortOption } from "@/types/types";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../shadcn/select";
import { Separator } from "../shadcn/separator";
import { Slider } from "../shadcn/slider";
import { Checkbox } from "../shadcn/checkbox";
import { Button } from "../shadcn/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../shadcn/sheet";
import { Label } from "../shadcn/label";
import { Input } from "../shadcn/input";
import { ScrollArea } from "../shadcn/scroll-area";
import { ZodErrors } from "../zodErrors/ZodErrors";
import { getPlacesData } from "@/data/loaders";

const schema = z.object({
    name: z.string().max(255, "Name must be less than 255 characters long"),
});

interface PlaceFilterAndSortProps {
    placesData: IPlace[];
    setFilteredPlaces?: Dispatch<SetStateAction<IPlace[]>>;
}

export default function PlaceFilterAndSort({
    placesData,
    setFilteredPlaces,
}: Readonly<PlaceFilterAndSortProps>) {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedSort, setSelectedSort] = useState<SortOption>("default");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedLocation, setSelectedLocation] = useState<string>("all");
    const [priceRange, setPriceRange] = useState<number[]>([
        0,
        placesData.reduce(
            (accumulator, currentValue) =>
                accumulator > currentValue.price
                    ? accumulator
                    : currentValue.price,
            0,
        ),
    ]);
    const [facilities, setFacilities] = useState<Record<FacilityKeys, boolean>>(
        {
            parking: false,
            pet_friendly: false,
            wheelchair_access: false,
            wifi: false,
        },
    );
    const [nameError, setNameError] = useState<string[] | undefined>();

    const categories = useMemo(
        () => Array.from(new Set(placesData.map((place) => place.category))),
        [placesData],
    );
    const locations = useMemo(
        () => Array.from(new Set(placesData.map((place) => place.location))),
        [placesData],
    );
    const maxPrice = useMemo(
        () =>
            placesData.reduce(
                (accumulator, currentValue) =>
                    accumulator > currentValue.price
                        ? accumulator
                        : currentValue.price,
                0,
            ),
        [placesData],
    );

    const handleFilterPlaces = useCallback(() => {
        if (!setFilteredPlaces) {
            return;
        }

        const filteredResult = placesData.filter((place) => {
            const validatedFields = schema.safeParse({
                name: place.name.toLowerCase().trim(),
            });

            if (!validatedFields.success) {
                setNameError(
                    z.flattenError(validatedFields.error).fieldErrors.name,
                );

                console.error(validatedFields.error.message);
                throw new Error("Value must contain only numbers");
            }

            setNameError(undefined);

            const matchesSearch = place.name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            const matchesCategory =
                selectedCategory === "all" ||
                place.category === selectedCategory;

            const matchesLocation =
                selectedLocation === "all" ||
                place.location === selectedLocation;

            const matchesPrice =
                place.price >= priceRange[0] && place.price <= priceRange[1];

            const matchesFacilities = (
                Object.keys(facilities) as FacilityKeys[]
            ).every((key) => {
                return !facilities[key] || place.facilities[key];
            });

            return (
                matchesSearch &&
                matchesCategory &&
                matchesLocation &&
                matchesPrice &&
                matchesFacilities
            );
        });

        filteredResult.sort((a, b) => {
            switch (selectedSort) {
                case "price_asc":
                    return a.price - b.price;
                case "price_desc":
                    return b.price - a.price;
                case "rating_desc":
                    return b.rating - a.rating;
                case "name_asc":
                    return a.name.localeCompare(b.name);
                case "name_desc":
                    return b.name.localeCompare(a.name);
                default:
                    return 0;
            }
        });

        setFilteredPlaces(filteredResult);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        searchQuery,
        selectedSort,
        selectedCategory,
        selectedLocation,
        priceRange,
        facilities,
        placesData,
    ]);

    const handleResetFilters = () => {
        setSearchQuery("");
        setSelectedSort("default");
        setSelectedCategory("all");
        setSelectedLocation("all");
        setPriceRange([0, 500]);
        setFacilities({
            parking: false,
            pet_friendly: false,
            wheelchair_access: false,
            wifi: false,
        });
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="default"
                    className="gap-2 text-white bg-bright-blue hover:bg-blue-600"
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filter & Sort
                </Button>
            </SheetTrigger>
            <SheetContent
                side="right"
                className="w-svw sm:w-[400px] z-[1050]"
                overlayClassName="bg-black/40 z-[1040]"
            >
                <SheetHeader className="px-1">
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>
                        Adjust your preferences to find the best spots.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-180px)] mt-6">
                    <div className="grid gap-6 px-1">
                        <div className="grid gap-2">
                            <Label>Search by name</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Type name..."
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                />
                                <ZodErrors error={nameError} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Sort</Label>
                            <Select
                                value={selectedSort}
                                onValueChange={(value) =>
                                    setSelectedSort(value as SortOption)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sorting" />
                                </SelectTrigger>
                                <SelectContent className="z-[1050]">
                                    <SelectItem value="default" hidden>
                                        <div className="flex items-center gap-2">
                                            <ArrowUpDown className="h-4 w-4" />
                                            <span>By default</span>
                                        </div>
                                    </SelectItem>
                                    <Separator />
                                    <SelectItem value="price_asc">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            <span>Price: Low to High</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="price_desc">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            <span>Price: High to Low</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="rating_desc">
                                        <div className="flex items-center gap-2">
                                            <Star
                                                className="h-4 w-4"
                                                fill="#fff"
                                            />
                                            <span>Highest Rated</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="name_asc">
                                        <div className="flex items-center gap-2">
                                            <TextQuote className="h-4 w-4" />
                                            <span>Name (A-Z)</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="name_desc">
                                        <div className="flex items-center gap-2">
                                            <TextQuote className="h-4 w-4" />
                                            <span>Name (Z-A)</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Category</Label>
                            <Select
                                value={selectedCategory}
                                onValueChange={setSelectedCategory}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All categories" />
                                </SelectTrigger>
                                <SelectContent className="z-[1050]">
                                    <SelectItem value="all">
                                        All categories
                                    </SelectItem>
                                    <Separator />
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Location</Label>
                            <Select
                                value={selectedLocation}
                                onValueChange={setSelectedLocation}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All locations" />
                                </SelectTrigger>
                                <SelectContent className="z-[1050]">
                                    <SelectItem value="all">
                                        All locations
                                    </SelectItem>
                                    <Separator />
                                    {locations.map((location) => (
                                        <SelectItem
                                            key={location}
                                            value={location}
                                        >
                                            {location}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Separator />
                        <div className="grid gap-4">
                            <div className="flex justify-between">
                                <Label>Max Price</Label>
                                <span className="text-sm text-muted-foreground">
                                    {priceRange[0]} - {priceRange[1]} $
                                </span>
                            </div>
                            <Slider
                                value={priceRange}
                                max={maxPrice}
                                step={10}
                                onValueChange={setPriceRange}
                                className="py-4"
                                rangeClassName="bg-bright-blue"
                            />
                        </div>
                        <Separator />
                        <div className="grid gap-3">
                            <Label>Facilities</Label>
                            <div className="grid gap-3">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="parking"
                                        checked={facilities.parking}
                                        onCheckedChange={(value) =>
                                            setFacilities({
                                                ...facilities,
                                                parking: !!value,
                                            })
                                        }
                                    />
                                    <Label
                                        htmlFor="parking"
                                        className="text-sm font-normal"
                                    >
                                        Parking
                                    </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="wifi"
                                        checked={facilities.wifi}
                                        onCheckedChange={(value) =>
                                            setFacilities({
                                                ...facilities,
                                                wifi: !!value,
                                            })
                                        }
                                    />
                                    <Label
                                        htmlFor="wifi"
                                        className="text-sm font-normal"
                                    >
                                        Wi-Fi
                                    </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="pet"
                                        checked={facilities.pet_friendly}
                                        onCheckedChange={(value) =>
                                            setFacilities({
                                                ...facilities,
                                                pet_friendly: !!value,
                                            })
                                        }
                                    />
                                    <Label
                                        htmlFor="pet"
                                        className="text-sm font-normal"
                                    >
                                        Pet Friendly
                                    </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="wheelchair"
                                        checked={facilities.wheelchair_access}
                                        onCheckedChange={(value) =>
                                            setFacilities({
                                                ...facilities,
                                                wheelchair_access: !!value,
                                            })
                                        }
                                    />
                                    <Label
                                        htmlFor="wheelchair"
                                        className="text-sm font-normal"
                                    >
                                        Wheelchair Access
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
                <SheetFooter className="absolute bottom-0 left-0 w-full p-6 bg-background border-t">
                    <div className="flex w-full gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleResetFilters}
                        >
                            Reset
                        </Button>
                        <Button
                            className="flex-1 text-white bg-bright-blue hover:bg-blue-600"
                            onClick={handleFilterPlaces}
                        >
                            Apply Filters
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
