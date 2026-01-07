"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CreateTaskFormProps {
    projectId: string;
    members: Array<{ id: string; userId: string; user: { id: string; name: string } }>;
}

export function CreateTaskForm({ projectId, members }: CreateTaskFormProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        assigneeIds: [] as string[],
        priority: "3",
        dueDate: "",
    });

    const toggleAssignee = (userId: string) => {
        setFormData(prev => ({
            ...prev,
            assigneeIds: prev.assigneeIds.includes(userId)
                ? prev.assigneeIds.filter(id => id !== userId)
                : [...prev.assigneeIds, userId]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        setLoading(true);
        try {
            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    priority: formData.priority,
                    dueDate: formData.dueDate,
                    projectId,
                    assigneeIds: formData.assigneeIds,
                }),
            });

            if (!res.ok) throw new Error("Failed to create task");

            setFormData({ title: "", description: "", assigneeIds: [], priority: "3", dueDate: "" });
            setIsOpen(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("タスク作成に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <tr
                className="bg-gray-50 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => setIsOpen(true)}
            >
                <td colSpan={6} className="px-6 py-3 text-sm text-blue-600 font-medium">
                    <span className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        タスクを追加...
                    </span>
                </td>
            </tr>
        );
    }

    return (
        <tr className="bg-blue-50 border-2 border-blue-200">
            <td colSpan={6} className="px-4 py-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                placeholder="タスク名を入力..."
                                required
                                autoFocus
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs text-gray-500 mb-2">担当者（複数選択可）</label>
                            <div className="flex flex-wrap gap-2">
                                {members.map((m) => (
                                    <label
                                        key={m.userId}
                                        className={`flex items-center px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${formData.assigneeIds.includes(m.userId)
                                                ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                                                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.assigneeIds.includes(m.userId)}
                                            onChange={() => toggleAssignee(m.userId)}
                                            className="sr-only"
                                        />
                                        <span className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-[10px] mr-2">
                                            {m.user.name.charAt(0)}
                                        </span>
                                        {m.user.name}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">優先度</label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="5">緊急</option>
                                <option value="4">高</option>
                                <option value="3">中</option>
                                <option value="2">低</option>
                                <option value="1">いつか</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-500 mb-1">期限</label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">メモ</label>
                            <input
                                type="text"
                                placeholder="メモ（任意）"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.title.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "作成中..." : "タスクを作成"}
                        </button>
                    </div>
                </form>
            </td>
        </tr>
    );
}

