export default function Loading() {
    return (
        <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm">読み込み中...</p>
            </div>
        </div>
    );
}
