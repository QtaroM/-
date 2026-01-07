"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
    { name: "ホーム", href: "/app/home", icon: "HomeIcon" },
    { name: "マイタスク", href: "/app/my-tasks", icon: "CheckCircleIcon" },
    { name: "プロジェクト", href: "/app/projects", icon: "FolderIcon" },
    { name: "メンバー別", href: "/app/users", icon: "UsersIcon" },
];

interface SidebarProps {
    user?: {
        name: string;
        email: string;
        avatarUrl?: string | null;
    } | null;
}

export function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col w-64 bg-gray-900 text-white min-h-screen border-r border-gray-800">
            <div className="p-6">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                    クラビジ
                    <br />
                    タスク管理マン
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navigation.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200",
                                isActive
                                    ? "bg-gray-800 text-white"
                                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                            )}
                        >
                            {/* Simple SVG Icons */}
                            <span className="mr-3">
                                {item.icon === "HomeIcon" && (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                )}
                                {item.icon === "CheckCircleIcon" && (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                {item.icon === "FolderIcon" && (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                    </svg>
                                )}
                                {item.icon === "UsersIcon" && (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                )}
                            </span>
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 mr-3 flex items-center justify-center overflow-hidden">
                        {user?.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" /> : <span className="text-white text-xs">{user?.name?.charAt(0)}</span>}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white">{user?.name || "ゲスト"}</p>
                        <p className="text-xs text-gray-500">{user?.email || ""}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
