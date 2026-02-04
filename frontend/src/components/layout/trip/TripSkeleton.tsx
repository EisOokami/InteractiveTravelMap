export default function TripSkeleton() {
    return (
        <section className="absolute flex flex-col w-screen md:w-[400px] lg:w-[500px] xl:w-[600px] h-full bg-white dark:bg-dark-mode-black z-[1999] transition-colors">
            <div className="p-4 md:p-6 border-b dark:border-gray-800">
                <div className="w-32 h-8 md:h-9 mb-4 md:mb-6 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="flex flex-col justify-center items-center gap-2 h-full p-2 md:p-4 bg-gray-100 dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                            <div className="w-5 h-5 md:w-6 md:h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                            <div className="w-12 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
            <div className="custom-scroll grid gap-8 p-3 md:p-6 overflow-x-hidden overflow-y-auto">
                {[1, 2].map((dateIndex) => (
                    <div key={dateIndex} className="grid gap-4">
                        <div className="sticky -top-3 md:-top-6 py-3 bg-white dark:bg-dark-mode-black z-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="flex justify-center items-center w-8 md:w-10 h-8 md:h-10 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
                                <div className="w-32 h-6 md:h-7 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                            {[1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="relative flex md:grid w-full max-w-full mb-4 bg-white dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden"
                                >
                                    <div className="absolute top-3 left-3 w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse z-10" />
                                    <div className="relative w-1/3 md:w-full max-w-48 md:max-w-full h-48 max-h-40 md:max-h-48 bg-gray-300 dark:bg-gray-600 animate-pulse">
                                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                                            <div className="w-12 h-6 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" />
                                            <div className="hidden sm:block w-16 h-6 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="w-2/3 md:w-full p-4">
                                        <div className="w-3/4 h-6 mb-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                                            <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                        </div>
                                        <div className="mb-4 h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                        <div className="hidden xl:grid grid-cols-2 gap-3 mb-4">
                                            {[1, 2].map((i) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-dark-mode-black border border-gray-200 dark:border-gray-700 rounded-lg"
                                                >
                                                    <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
                                                    <div className="flex-1">
                                                        <div className="w-12 h-3 mb-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                                        <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {[1, 2, 3].map((i) => (
                                                <div
                                                    key={i}
                                                    className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-40 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
