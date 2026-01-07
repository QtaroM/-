"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TaskRowProps {
    task: {
        id: string;
        title: string;
        description?: string | null;
        status: string;
        priority: number;
        dueDate?: Date | string | null;
        assignees: Array<{ user: { id: string; name: string; avatarUrl?: string | null } }>;
        tags: Array<{ tag: { id: string; name: string; color?: string | null } }>;
    };
    members: Array<{ userId: string; user: { id: string; name: string } }>;
}

export function TaskRow({ task, members }: TaskRowProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority.toString(),
        assigneeIds: task.assignees?.map(a => a.user.id) || [],
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
    });

    const isDone = task.status === "done";

    const toggleAssignee = (userId: string) => {
        setFormData(prev => ({
            ...prev,
            assigneeIds: prev.assigneeIds.includes(userId)
                ? prev.assigneeIds.filter(id => id !== userId)
                : [...prev.assigneeIds, userId]
        }));
    };

    const handleToggleComplete = async () => {
        setLoading(true);
        try {
            const newStatus = isDone ? "todo" : "done";
            await fetch(`/api/tasks/${task.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await fetch(`/api/tasks/${task.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    status: formData.status,
                    priority: parseInt(formData.priority),
                    assigneeIds: formData.assigneeIds,
                    dueDate: formData.dueDate || null,
                }),
            });
            setIsEditing(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("保存に失敗しました");
        } finally {
            setLoading(false);
        }
    };

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        console.log("Delete confirmed, sending request...");
        try {
            const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
            console.log("Delete response status:", res.status);

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Delete failed server-side:", errorData);
                throw new Error(errorData.error || "Delete failed");
            }

            console.log("Delete successful, refreshing router...");
            router.refresh();
        } catch (error) {
            console.error("Delete error caught:", error);
            alert("削除に失敗しました");
            setIsDeleteModalOpen(false); // Close on error
        } finally {
            setLoading(false);
        }
    };

    if (isEditing) {
        return (
            <tr className="bg-blue-50 border-l-4 border-blue-500">
                <td colSpan={6} className="px-4 py-4">
                    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs text-gray-500 mb-1">タスク名</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    autoFocus
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
                                <label className="block text-xs text-gray-500 mb-1">ステータス</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option value="todo">未着手</option>
                                    <option value="doing">進行中</option>
                                    <option value="done">完了</option>
                                </select>
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
                                <label className="block text-xs text-gray-500 mb-1">メモ（成果物URL等）</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    placeholder="成果物のURLやメモを記入..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end items-center gap-2 pt-2 border-t border-blue-100">
                            <button
                                type="button"
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors mr-auto"
                            >
                                削除
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                キャンセル
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !formData.title.trim()}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? "保存中..." : "保存"}
                            </button>
                        </div>
                    </form>

                    {/* Delete Confirmation Modal */}
                    {isDeleteModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                                <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-red-700">タスクの削除</h3>
                                    <button onClick={() => setIsDeleteModalOpen(false)} className="text-red-400 hover:text-red-600">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="p-6">
                                    <p className="text-gray-700 mb-4">
                                        本当にタスク「<span className="font-bold">{task.title}</span>」を削除しますか？
                                    </p>
                                    <p className="text-sm text-gray-500 mb-6">
                                        この操作は取り消せません。
                                    </p>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => setIsDeleteModalOpen(false)}
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
                </td>
            </tr>
        );
    }

    return (
        <tr
            className={`hover:bg-gray-50 cursor-pointer transition-colors group ${isDone ? 'opacity-60' : ''}`}
            onClick={() => setIsEditing(true)}
        >
            <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <input
                    type="checkbox"
                    checked={isDone}
                    onChange={handleToggleComplete}
                    disabled={loading}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
            </td>
            <td className="px-6 py-4">
                <div className={`text-sm font-medium ${isDone ? 'text-gray-400 line-through' : 'text-gray-900 group-hover:text-blue-600'}`}>
                    {task.title}
                </div>
                {task.description && (
                    <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                        {task.description}
                    </div>
                )}
                <div className="flex space-x-2 mt-1">
                    {task.tags.map((t) => (
                        <span
                            key={t.tag.id}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            style={{ backgroundColor: t.tag.color ? `${t.tag.color}20` : undefined, color: t.tag.color || undefined }}
                        >
                            {t.tag.name}
                        </span>
                    ))}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                {task.assignees && task.assignees.length > 0 ? (
                    <div className="flex -space-x-2">
                        {task.assignees.slice(0, 3).map((a) => (
                            <div
                                key={a.user.id}
                                className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px]"
                                title={a.user.name}
                            >
                                {a.user.avatarUrl ? (
                                    <img src={a.user.avatarUrl} className="w-full h-full rounded-full" alt="" />
                                ) : (
                                    a.user.name.charAt(0)
                                )}
                            </div>
                        ))}
                        {task.assignees.length > 3 && (
                            <div className="h-6 w-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-[9px] text-gray-600">
                                +{task.assignees.length - 3}
                            </div>
                        )}
                    </div>
                ) : (
                    <span className="text-sm text-gray-400">未設定</span>
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
          ${task.priority >= 4 ? 'bg-red-100 text-red-800' :
                        task.priority === 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                    {task.priority === 5 ? '緊急' : task.priority === 4 ? '高' : task.priority === 3 ? '中' : '低'}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`px-2 py-1 rounded text-xs ${task.status === 'done' ? 'bg-green-100 text-green-800' :
                    task.status === 'doing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {task.status === 'done' ? '完了' : task.status === 'doing' ? '進行中' : '未着手'}
                </span>
            </td>
        </tr>
    );
}
