export default function UsersLoading() {
    return (
        <div className="animate-pulse">
            <div className="h-8 w-32 bg-gray-200 rounded mb-6"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                        <div className="flex-1">
                            <div className="h-5 w-24 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 w-32 bg-gray-100 rounded mb-2"></div>
                            <div className="h-4 w-16 bg-gray-100 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
