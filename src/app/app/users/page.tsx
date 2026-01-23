import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";

const getUsersData = unstable_cache(
    async () => {
        return prisma.user.findMany({
            orderBy: { name: "asc" },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                _count: {
                    select: {
                        taskAssignments: {
                            where: { task: { status: { not: "done" } } }
                        }
                    }
                }
            },
            take: 50,
        });
    },
    ["users-list"],
    { revalidate: 60 }
);

export default async function UsersPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const users = await getUsersData();

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">メンバー</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {users.map((user) => (
                    <Link key={user.id} href={`/app/users/${user.id}/tasks`} className="block group">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 overflow-hidden">
                                {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 group-hover:text-blue-600">{user.name}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                                <div className="mt-1 text-xs font-medium bg-green-50 text-green-700 inline-block px-2 py-0.5 rounded-full">
                                    タスク: {user._count.taskAssignments}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
