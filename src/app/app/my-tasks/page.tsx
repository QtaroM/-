import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function MyTasksPage() {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    // Redirect to user's own task page
    redirect(`/app/users/${session.userId}/tasks`);
}
