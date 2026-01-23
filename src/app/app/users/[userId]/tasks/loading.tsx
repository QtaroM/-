export default function UserTasksLoading() {
    return (
        <div className="h-full flex flex-col animate-pulse">
            <div className="flex-none mb-6 border-b border-gray-200 pb-4">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 mr-4"></div>
                    <div>
                        <div className="h-7 w-32 bg-gray-200 rounded"></div>
                        <div className="h-4 w-24 bg-gray-100 rounded mt-2"></div>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 py-3 px-6 border-b border-gray-200">
                    <div className="flex space-x-8">
                        <div className="h-4 w-8 bg-gray-200 rounded"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                        <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="divide-y divide-gray-200">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="py-4 px-6 flex space-x-8">
                            <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                            <div className="h-5 w-48 bg-gray-200 rounded"></div>
                            <div className="h-5 w-24 bg-gray-100 rounded"></div>
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
