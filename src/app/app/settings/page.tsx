import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { DeleteAccountButton } from "@/components/DeleteAccountButton";

export default async function SettingsPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            _count: {
                select: {
                    createdProjects: true,
                    taskAssignments: true
                }
            }
        }
    });

    if (!user) redirect("/login");

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">設定</h2>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900">プロフィール情報</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl text-gray-500 overflow-hidden">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                user.name.charAt(0)
                            )}
                        </div>
                        <div>
                            <div className="font-bold text-xl text-gray-900">{user.name}</div>
                            <div className="text-gray-500">{user.email}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                        <div>
                            <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">作成プロジェクト数</span>
                            <span className="text-lg font-semibold">{user._count.createdProjects}</span>
                        </div>
                        <div>
                            <span className="block text-xs uppercase tracking-wider text-gray-500 mb-1">担当タスク数</span>
                            <span className="text-lg font-semibold">{user._count.taskAssignments}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-red-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-red-100 bg-red-50">
                    <h3 className="text-lg font-medium text-red-700">Danger Zone</h3>
                    <p className="text-sm text-red-600 mt-1">この操作は元に戻せません。ご注意ください。</p>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                        アカウントを削除すると、あなたが作成したプロジェクト、タスク、コメントなど、すべてのデータが永久に削除されます。
                    </p>
                    <DeleteAccountButton userId={user.id} />
                </div>
            </div>
        </div>
    );
}
