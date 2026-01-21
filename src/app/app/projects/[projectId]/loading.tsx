export default function ProjectDetailLoading() {
    return (
        <div className="h-full flex flex-col animate-pulse">
            {/* Header skeleton */}
            <div className="flex-none mb-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded bg-gray-200 mr-3"></div>
                        <div>
                            <div className="h-7 w-48 bg-gray-200 rounded"></div>
                            <div className="h-4 w-64 bg-gray-100 rounded mt-2"></div>
                        </div>
                    </div>
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center mt-6 border-b border-gray-200 pb-2">
                    <div className="flex space-x-4">
                        <div className="h-6 w-16 bg-gray-200 rounded"></div>
                        <div className="h-6 w-16 bg-gray-100 rounded"></div>
                        <div className="h-6 w-20 bg-gray-100 rounded"></div>
                    </div>
                </div>
            </div>

            {/* Table skeleton */}
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 py-3 px-6 border-b border-gray-200">
                    <div className="flex space-x-8">
                        <div className="h-4 w-8 bg-gray-200 rounded"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                        <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="divide-y divide-gray-200">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="py-4 px-6 flex space-x-8">
                            <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                            <div className="h-5 w-48 bg-gray-200 rounded"></div>
                            <div className="flex -space-x-1">
                                <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                            </div>
                            <div className="h-5 w-20 bg-gray-100 rounded"></div>
                            <div className="h-5 w-12 bg-gray-100 rounded"></div>
                            <div className="h-5 w-16 bg-gray-100 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
