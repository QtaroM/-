"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Member {
    id: string;
    userId: string;
    role: string;
    user: {
        id: string;
        name: string;
        email: string;
        avatarUrl?: string | null;
    };
}

interface AddMemberModalProps {
    projectId: string;
    members: Member[];
    currentUserId: string;
}

export function AddMemberModal({ projectId, members, currentUserId }: AddMemberModalProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/projects/${projectId}/members`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "メンバー追加に失敗しました");
            }

            setEmail("");
            setIsOpen(false);
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (userId: string) => {
        if (!confirm("このメンバーを削除しますか？")) return;

        try {
            const res = await fetch(`/api/projects/${projectId}/members?userId=${userId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "削除に失敗しました");
            }

            router.refresh();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="w-8 h-8 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 text-xs transition-colors"
                title="メンバーを追加"
            >
                +
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">プロジェクトメンバー</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-500">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Add Member Form */}
                            <form onSubmit={handleAdd} className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    メールアドレスでメンバーを追加
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="email"
                                        placeholder="user@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading || !email.trim()}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {loading ? "..." : "追加"}
                                    </button>
                                </div>
                                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                            </form>

                            {/* Member List */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-3">現在のメンバー ({members.length})</h4>
                                <ul className="space-y-2 max-h-64 overflow-auto">
                                    {members.map((m) => (
                                        <li key={m.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm mr-3 overflow-hidden">
                                                    {m.user.avatarUrl ? (
                                                        <img src={m.user.avatarUrl} alt={m.user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        m.user.name.charAt(0)
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{m.user.name}</p>
                                                    <p className="text-xs text-gray-500">{m.user.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                    {m.role === "owner" ? "オーナー" : "メンバー"}
                                                </span>
                                                {m.userId !== currentUserId && (
                                                    <button
                                                        onClick={() => handleRemove(m.userId)}
                                                        className="text-gray-400 hover:text-red-500"
                                                        title="削除"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                閉じる
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
