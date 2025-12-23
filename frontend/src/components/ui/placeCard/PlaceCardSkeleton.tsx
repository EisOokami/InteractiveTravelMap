export default function PlaceDetailsSkeleton() {
    return (
        <section className="absolute w-screen md:w-[400px] lg:w-[500px] xl:w-[600px] h-full bg-white dark:bg-dark-mode-black overflow-y-hidden z-[1099] transition-colors">
            <div className="custom-scroll h-full overflow-y-auto">
                <div className="absolute top-4 left-4 w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full z-50 animate-pulse" />
                <div className="relative w-full h-80">
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-7 bg-gray-400 dark:bg-gray-600 rounded-full animate-pulse" />
                            <div className="w-24 h-7 bg-gray-400 dark:bg-gray-600 rounded-full animate-pulse" />
                        </div>
                    </div>
                </div>
                <div className="px-6 py-6">
                    <div className="w-3/4 h-9 mb-2 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="w-2/3 h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                    <div className="mb-6 space-y-2">
                        <div className="w-full h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="w-full h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="w-5/6 h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="flex-1">
                                <div className="w-12 h-3 bg-gray-300 dark:bg-gray-700 rounded mb-2 animate-pulse" />
                                <div className="w-16 h-5 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="flex-1">
                                <div className="w-16 h-3 bg-gray-300 dark:bg-gray-700 rounded mb-2 animate-pulse" />
                                <div className="w-20 h-5 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                        </div>
                    </div>
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="w-32 h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="grid gap-2 p-4 bg-gray-50 dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-lg">
                            {[...Array(7)].map((_, i) => (
                                <div
                                    key={i}
                                    className="flex justify-between items-center"
                                >
                                    <div className="w-20 h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                                    <div className="w-28 h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mb-6">
                        <div className="w-24 h-6 mb-3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="flex flex-wrap gap-3">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-32 h-9 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"
                                />
                            ))}
                        </div>
                    </div>
                    <div className="mb-6">
                        <div className="w-36 h-6 mb-3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="grid grid-cols-5 gap-2">
                            {[...Array(2)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-14 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"
                                />
                            ))}
                            <div className="h-14 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
