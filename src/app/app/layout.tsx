import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    const user = session ? await prisma.user.findUnique({ where: { id: session.userId } }) : null;

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar user={user} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
