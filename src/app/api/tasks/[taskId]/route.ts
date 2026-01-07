import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ taskId: string }> }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { taskId } = await params;
        const body = await req.json();

        // Extract assigneeIds separately
        const { assigneeIds, ...restBody } = body;

        // Convert types if necessary
        const data: any = { ...restBody };
        if (data.priority) data.priority = parseInt(data.priority);
        if (data.dueDate) data.dueDate = new Date(data.dueDate);
        if (data.dueDate === "") data.dueDate = null;

        // Update task
        const task = await prisma.task.update({
            where: { id: taskId },
            data,
            include: { assignees: { include: { user: true } }, project: true }
        });

        // If assigneeIds provided, replace all assignees
        if (assigneeIds !== undefined) {
            // Delete existing assignees
            await prisma.taskAssignee.deleteMany({
                where: { taskId }
            });

            // Create new assignees
            if (assigneeIds.length > 0) {
                // SQLite doesn't support createMany, use transaction or Promise.all
                await Promise.all(assigneeIds.map((userId: string) =>
                    prisma.taskAssignee.create({
                        data: { taskId, userId }
                    })
                ));
            }

            // Refetch task with updated assignees
            const updatedTask = await prisma.task.findUnique({
                where: { id: taskId },
                include: { assignees: { include: { user: true } }, project: true }
            });
            return NextResponse.json(updatedTask);
        }

        return NextResponse.json(task);
    } catch (error) {
        console.error("Update task error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ taskId: string }> }) {
    try {
        console.log("DELETE /api/tasks/[taskId] request received");
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { taskId } = await params;

        await prisma.task.delete({
            where: { id: taskId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete task error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
