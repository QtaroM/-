"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteProjectButton({ projectId, projectName }: { projectId: string; projectName: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [isOpen, setIsOpen] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${projectId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete project");
            }

            // alert("プロジェクトを削除しました"); // Remove alert to be cleaner
            router.push("/app/projects");
            router.refresh();
        } catch (error: any) {
            console.error(error);
            alert(error.message || "削除に失敗しました");
            setLoading(false);
            setIsOpen(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors"
            >
                プロジェクト削除
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-red-700">プロジェクトの削除</h3>
                            <button onClick={() => setIsOpen(false)} className="text-red-400 hover:text-red-600">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 mb-4">
                                本当にプロジェクト「<span className="font-bold">{projectName}</span>」を削除しますか？
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                この操作は取り消せません。プロジェクトに含まれるすべてのタスク、コメント、メンバーシップ情報が永久に削除されます。
                            </p>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    キャンセル
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                >
                                    {loading ? "削除中..." : "削除する"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
