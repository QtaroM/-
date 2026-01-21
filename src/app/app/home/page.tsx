import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { unstable_cache } from "next/cache";

// Cache home data for 30 seconds
const getHomeData = unstable_cache(
    async (userId: string) => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        const [todayTasks, overdueTasks, highPriorityTasks, projects] = await Promise.all([
            prisma.task.findMany({
                where: {
                    assignees: { some: { userId } },
                    dueDate: { gte: startOfToday, lt: endOfToday },
                    status: { not: "done" },
                },
                select: {
                    id: true,
                    title: true,
                    projectId: true,
                    project: { select: { name: true } },
                },
                orderBy: { priority: "desc" },
                take: 10,
            }),
            prisma.task.findMany({
                where: {
                    assignees: { some: { userId } },
                    dueDate: { lt: startOfToday },
                    status: { not: "done" },
                },
                select: {
                    id: true,
                    title: true,
                    dueDate: true,
                    projectId: true,
                },
                orderBy: { dueDate: "asc" },
                take: 10,
            }),
            prisma.task.findMany({
                where: {
                    assignees: { some: { userId } },
                    priority: { gte: 4 },
                    status: { not: "done" },
                },
                select: {
                    id: true,
                    title: true,
                    priority: true,
                    projectId: true,
                    project: { select: { name: true } },
                },
                orderBy: { priority: "desc" },
                take: 10,
            }),
            prisma.project.findMany({
                where: {
                    members: { some: { userId } },
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    _count: {
                        select: {
                            tasks: {
                                where: {
                                    assignees: { some: { userId } },
                                    status: { not: "done" },
                                },
                            },
                        },
                    },
                },
                take: 8,
            }),
        ]);

        return { todayTasks, overdueTasks, highPriorityTasks, projects };
    },
    ["home-data"],
    { revalidate: 30 }
);

export default async function HomePage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const { todayTasks, overdueTasks, highPriorityTasks, projects } = await getHomeData(session.userId);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">ホーム</h2>
                <p className="text-gray-600">ようこそ、今日のタスクを確認しましょう。</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Today's Tasks */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <span className="bg-blue-100 text-blue-800 p-1.5 rounded-full mr-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </span>
                        今日が期限 ({todayTasks.length})
                    </h3>
                    <ul className="space-y-3">
                        {todayTasks.length === 0 ? (
                            <li className="text-gray-400 text-sm">今日のタスクはありません</li>
                        ) : (
                            todayTasks.map((task) => (
                                <li key={task.id} className="text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                    <Link href={`/app/projects/${task.projectId}`} className="hover:text-blue-600 block">
                                        <div className="font-medium text-gray-800">{task.title}</div>
                                        <div className="text-xs text-gray-500 mt-1">{task.project.name}</div>
                                    </Link>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                {/* Overdue Tasks */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-medium text-red-700 mb-4 flex items-center">
                        <span className="bg-red-100 text-red-800 p-1.5 rounded-full mr-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </span>
                        期限切れ ({overdueTasks.length})
                    </h3>
                    <ul className="space-y-3">
                        {overdueTasks.length === 0 ? (
                            <li className="text-gray-400 text-sm">期限切れタスクはありません</li>
                        ) : (
                            overdueTasks.map((task) => (
                                <li key={task.id} className="text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                    <Link href={`/app/projects/${task.projectId}`} className="hover:text-red-600 block">
                                        <div className="font-medium text-gray-800">{task.title}</div>
                                        <div className="text-xs text-red-500 mt-1">
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ""}
                                        </div>
                                    </Link>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                {/* High Priority Tasks */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-medium text-orange-700 mb-4 flex items-center">
                        <span className="bg-orange-100 text-orange-800 p-1.5 rounded-full mr-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </span>
                        優先度: 高 ({highPriorityTasks.length})
                    </h3>
                    <ul className="space-y-3">
                        {highPriorityTasks.length === 0 ? (
                            <li className="text-gray-400 text-sm">優先度の高いタスクはありません</li>
                        ) : (
                            highPriorityTasks.map((task) => (
                                <li key={task.id} className="text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                    <Link href={`/app/projects/${task.projectId}`} className="hover:text-amber-600 block">
                                        <div className="font-medium text-gray-800">{task.title}</div>
                                        <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${task.priority === 5 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                                                {task.priority === 5 ? '緊急' : '高'}
                                            </span>
                                            <span>{task.project.name}</span>
                                        </div>
                                    </Link>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">参加プロジェクト</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {projects.map((project) => (
                        <Link key={project.id} href={`/app/projects/${project.id}`} className="block group">
                            <div className="bg-white h-full p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all">
                                <div className="flex items-start justify-between">
                                    <div className="w-10 h-10 rounded bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg mb-3">
                                        {project.name.charAt(0)}
                                    </div>
                                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                        {project._count.tasks} タスク
                                    </span>
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 truncate">{project.name}</h4>
                                <p className="text-sm text-gray-500 mt-2 line-clamp-2 min-h-[2.5em]">
                                    {project.description || "説明なし"}
                                </p>
                            </div>
                        </Link>
                    ))}
                    <Link href="/app/projects" className="block group">
                        <div className="bg-gray-50 h-full p-5 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all min-h-[160px]">
                            <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-sm font-medium">プロジェクト一覧へ</span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
