"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteAccountButton({ userId }: { userId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm("本当にアカウントを削除しますか？\nこの操作は取り消せません。あなたが作成したすべてのプロジェクトとタスクも削除されます。")) {
            return;
        }

        if (!confirm("本当に削除してよろしいですか？\nこの操作を行うと、データは永久に失われます。")) {
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/users/${userId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete account");
            }

            alert("アカウントを削除しました。ご利用ありがとうございました。");
            // Force hard reload/redirect to clear any client state
            window.location.href = "/signup";
        } catch (error: any) {
            console.error(error);
            alert(error.message || "削除に失敗しました");
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="w-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-red-200"
        >
            {loading ? "削除中..." : "アカウントを削除する"}
        </button>
    );
}
