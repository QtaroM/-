import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { userId } = await params;

        // Ensure user is deleting themselves
        if (session.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Transaction to delete everything
        // 1. Delete projects created by this user
        //    (This will cascade delete tasks, members, etc. associated with those projects)
        // 2. Delete the user
        //    (This will cascade delete their membership in other projects, assigned tasks, comments, etc.)

        // Note: Prisma deleteMany doesn't technically trigger database level cascades for SQLite unless configured,
        // but here we rely on the schema's onDelete: Cascade for the relations.
        // However, Project.createdById does NOT have Cascade, so we MUST delete projects first.

        // We find projects to delete first (optional, but deleteMany is fine)
        const ownedProjects = await prisma.project.findMany({
            where: { createdById: userId },
            select: { id: true }
        });

        const deleteProjects = prisma.project.deleteMany({
            where: { createdById: userId }
        });

        const deleteUser = prisma.user.delete({
            where: { id: userId }
        });

        await prisma.$transaction([deleteProjects, deleteUser]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete user error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
