"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface MyTaskRowProps {
    task: {
        id: string;
        title: string;
        description?: string | null;
        status: string;
        priority: number;
        dueDate?: Date | string | null;
        project: { id: string; name: string };
        tags: Array<{ tag: { id: string; name: string; color?: string | null } }>;
    };
}

export function MyTaskRow({ task }: MyTaskRowProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const isDone = task.status === "done";

    const handleToggleComplete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

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

    return (
        <tr className={`hover:bg-gray-50 transition-colors ${isDone ? 'opacity-60' : ''}`}>
            <td className="px-6 py-4 whitespace-nowrap">
                <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => { }}
                    onClick={handleToggleComplete}
                    disabled={loading}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
            </td>
            <td className="px-6 py-4">
                <Link
                    href={`/app/projects/${task.project.id}`}
                    className={`text-sm font-medium ${isDone ? 'text-gray-400 line-through' : 'text-gray-900 hover:text-blue-600'}`}
                >
                    {task.title}
                </Link>
                {task.description && (
                    <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                        {task.description}
                    </div>
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Link
                    href={`/app/projects/${task.project.id}`}
                    className="text-blue-600 hover:text-blue-800"
                >
                    {task.project.name}
                </Link>
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
