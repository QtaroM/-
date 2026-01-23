import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MyTaskRow } from "@/components/MyTaskRow";
import { unstable_cache } from "next/cache";

const getUserTasksData = unstable_cache(
    async (userId: string) => {
        const [user, tasks] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, name: true, avatarUrl: true },
            }),
            prisma.task.findMany({
                where: { assignees: { some: { userId } } },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    status: true,
                    priority: true,
                    dueDate: true,
                    projectId: true,
                    project: { select: { id: true, name: true } },
                    tags: {
                        select: {
                            tag: { select: { id: true, name: true, color: true } },
                        },
                    },
                    assignees: {
                        select: {
                            user: { select: { id: true, name: true, avatarUrl: true } },
                        },
                    },
                },
                orderBy: { priority: "desc" },
                take: 100,
            }),
        ]);
        return { user, tasks };
    },
    ["user-tasks"],
    { revalidate: 30 }
);

export default async function UserTasksPage({ params }: { params: Promise<{ userId: string }> }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const { userId } = await params;
    const { user, tasks } = await getUserTasksData(userId);

    if (!user) {
        return <div>User not found</div>;
    }

    const isMe = session.userId === userId;
    const incompleteTasks = tasks.filter((t) => t.status !== "done");
    const completedTasks = tasks.filter((t) => t.status === "done");

    return (
        <div className="h-full flex flex-col">
            <div className="flex-none mb-6 border-b border-gray-200 pb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-pink-400 flex items-center justify-center text-white mr-4 text-xl overflow-hidden">
                        {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                    </div>
                    {isMe ? "マイタスク" : `${user.name} のタスク`}
                </h2>
                <p className="text-sm text-gray-500 mt-2 ml-14">
                    <span className="font-medium text-gray-700">{incompleteTasks.length}</span> 件の未完了タスク
                </p>
            </div>

            <div className="flex-1 overflow-auto bg-white rounded-lg shadow-sm border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th scope="col" className="w-10 px-6 py-3"></th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">タスク名</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">プロジェクト</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">期限</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">優先度</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tasks.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                                    担当しているタスクはありません。
                                </td>
                            </tr>
                        ) : (
                            <>
                                {incompleteTasks.map((task: any) => (
                                    <MyTaskRow key={task.id} task={task} />
                                ))}

                                {completedTasks.length > 0 && (
                                    <>
                                        <tr className="bg-gray-100">
                                            <td colSpan={6} className="px-6 py-2 text-xs font-medium text-gray-500 uppercase">
                                                完了済み ({completedTasks.length})
                                            </td>
                                        </tr>
                                        {completedTasks.map((task: any) => (
                                            <MyTaskRow key={task.id} task={task} />
                                        ))}
                                    </>
                                )}
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
