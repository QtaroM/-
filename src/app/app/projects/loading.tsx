export default function ProjectsLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="h-8 w-40 bg-gray-200 rounded"></div>
                <div className="h-10 w-32 bg-gray-200 rounded"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gray-200 rounded mr-4"></div>
                            <div className="flex-1">
                                <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
                                <div className="h-3 w-20 bg-gray-100 rounded"></div>
                            </div>
                        </div>
                        <div className="h-4 w-full bg-gray-100 rounded mb-2"></div>
                        <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
