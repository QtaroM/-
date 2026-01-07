import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserTasksPage from "../users/[userId]/tasks/page";

export default async function MyTasksPage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    return <UserTasksPage params={{ userId: session.userId }} />;
}
