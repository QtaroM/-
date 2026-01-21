import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateTaskForm } from "@/components/CreateTaskForm";
import { AddMemberModal } from "@/components/AddMemberModal";
import { TaskRow } from "@/components/TaskRow";
import { DeleteProjectButton } from "@/components/DeleteProjectButton";
import { unstable_cache } from "next/cache";

// Cache project data for 30 seconds
const getProjectData = unstable_cache(
    async (projectId: string) => {
        return prisma.project.findUnique({
            where: { id: projectId },
            select: {
                id: true,
                name: true,
                description: true,
                createdById: true,
                members: {
                    select: {
                        id: true,
                        userId: true,
                        role: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
                tasks: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        status: true,
                        priority: true,
                        dueDate: true,
                        assignees: {
                            select: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        avatarUrl: true,
                                    },
                                },
                            },
                        },
                        tags: {
                            select: {
                                tag: {
                                    select: {
                                        id: true,
                                        name: true,
                                        color: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: [
                        { priority: "desc" },
                        { createdAt: "desc" },
                    ],
                },
            },
        });
    },
    ["project-data"],
    { revalidate: 30 }
);

export default async function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const { projectId } = await params;

    const project = await getProjectData(projectId);

    if (!project) {
        return <div>Project not found</div>;
    }

    // Check access
    const membership = project.members.find((m) => m.userId === session.userId);
    if (!membership) {
        return <div>Access denied</div>;
    }

    const isOwner = project.createdById === session.userId || membership.role === "owner";

    // Group tasks by completion status
    const incompleteTasks = project.tasks.filter((t) => t.status !== "done");
    const completedTasks = project.tasks.filter((t) => t.status === "done");

    return (
        <div className="h-full flex flex-col">
            {/* Project Header */}
            <div className="flex-none mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                            <span className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-sm mr-3">
                                {project.name.charAt(0)}
                            </span>
                            {project.name}
                        </h2>
                        <p className="text-gray-500 mt-1 ml-11">{project.description}</p>
                    </div>
                    <div className="flex -space-x-2 items-center">
                        {project.members.map((m) => (
                            <div key={m.id} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs overflow-hidden" title={m.user.name}>
                                {m.user.avatarUrl ? <img src={m.user.avatarUrl} alt={m.user.name} /> : m.user.name.charAt(0)}
                            </div>
                        ))}
                        <AddMemberModal projectId={projectId} members={project.members} currentUserId={session.userId} />
                    </div>
                </div>

                {/* Toolbar / Filters */}
                <div className="flex items-center justify-between mt-6 border-b border-gray-200 pb-2">
                    <div className="flex items-center space-x-4">
                        <button className="text-blue-600 border-b-2 border-blue-600 px-2 py-1 font-medium text-sm">リスト</button>
                        <button className="text-gray-500 hover:text-gray-700 px-2 py-1 font-medium text-sm">ボード</button>
                        <button className="text-gray-500 hover:text-gray-700 px-2 py-1 font-medium text-sm">カレンダー</button>
                        <div className="border-l border-gray-300 h-5 mx-2"></div>
                        <div className="text-sm text-gray-500">
                            <span className="font-medium text-gray-700">{incompleteTasks.length}</span> 件の未完了タスク
                        </div>
                    </div>

                    {isOwner && (
                        <DeleteProjectButton projectId={projectId} projectName={project.name} />
                    )}
                </div>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-auto bg-white rounded-lg shadow-sm border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 text-left sticky top-0">
                        <tr>
                            <th scope="col" className="w-10 px-6 py-3"></th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">タスク名</th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">担当者</th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">期限</th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">優先度</th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <CreateTaskForm projectId={projectId} members={project.members} />

                        {project.tasks.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                                    タスクがまだありません。上の「+ タスクを追加...」から追加してください。
                                </td>
                            </tr>
                        ) : (
                            <>
                                {incompleteTasks.map((task: any) => (
                                    <TaskRow key={task.id} task={task} members={project.members} />
                                ))}

                                {completedTasks.length > 0 && (
                                    <>
                                        <tr className="bg-gray-100">
                                            <td colSpan={6} className="px-6 py-2 text-xs font-medium text-gray-500 uppercase">
                                                完了済み ({completedTasks.length})
                                            </td>
                                        </tr>
                                        {completedTasks.map((task: any) => (
                                            <TaskRow key={task.id} task={task} members={project.members} />
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
