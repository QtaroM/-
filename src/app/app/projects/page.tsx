import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { unstable_cache } from "next/cache";

const getProjectsData = unstable_cache(
    async (userId: string) => {
        return prisma.project.findMany({
            where: {
                members: { some: { userId } },
            },
            select: {
                id: true,
                name: true,
                description: true,
                _count: {
                    select: {
                        tasks: { where: { status: { not: "done" } } }
                    }
                },
                members: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                name: true,
                                avatarUrl: true,
                            },
                        },
                    },
                    take: 3
                }
            },
            orderBy: { updatedAt: 'desc' },
            take: 20,
        });
    },
    ["projects-list"],
    { revalidate: 30 }
);

export default async function ProjectsPage() {
    const session = await getSession();
    if (!session) return null;

    const projects = await getProjectsData(session.userId);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">プロジェクト</h2>
                    <p className="text-gray-600">参加しているプロジェクト一覧</p>
                </div>
                <CreateProjectModal />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Link key={project.id} href={`/app/projects/${project.id}`} className="block group">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all h-full flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                    {project.name.charAt(0)}
                                </div>
                                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                                    残タスク: {project._count.tasks}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 truncate">
                                {project.name}
                            </h3>

                            <p className="text-sm text-gray-500 mb-4 flex-grow line-clamp-3">
                                {project.description || "説明なし"}
                            </p>

                            <div className="flex items-center pt-4 border-t border-gray-100 mt-auto">
                                <div className="flex -space-x-2 mr-3">
                                    {project.members.map((member) => (
                                        <div key={member.id} className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-[10px] text-gray-600 overflow-hidden" title={member.user.name}>
                                            {member.user.avatarUrl ? (
                                                <img src={member.user.avatarUrl} alt={member.user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{member.user.name.charAt(0)}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {project.members.length > 3 && <span className="text-xs text-gray-400">...</span>}
                            </div>
                        </div>
                    </Link>
                ))}

                {projects.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-white rounded-lg border border-dashed border-gray-300">
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900">プロジェクトがありません</h3>
                        <p className="text-gray-500 mt-1">新しいプロジェクトを作成してタスク管理を始めましょう。</p>
                    </div>
                )}
            </div>
        </div>
    );
}
