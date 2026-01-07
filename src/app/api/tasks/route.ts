import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { title, projectId, description, priority, assigneeIds, dueDate } = body;

        if (!title || !projectId) {
            return NextResponse.json({ error: "Title and Project ID are required" }, { status: 400 });
        }

        const task = await prisma.task.create({
            data: {
                title,
                projectId,
                description,
                priority: priority ? parseInt(priority) : 3,
                dueDate: dueDate ? new Date(dueDate) : null,
                assignees: assigneeIds && assigneeIds.length > 0 ? {
                    create: assigneeIds.map((userId: string) => ({ userId }))
                } : undefined,
            },
            include: {
                assignees: { include: { user: true } },
                project: true
            }
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error("Create task error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q) return NextResponse.json([]);

    try {
        const tasks = await prisma.task.findMany({
            where: {
                OR: [
                    { title: { contains: q } }, // Default is case-insensitive in SQLite usually, checking for Postgres compat later
                    { description: { contains: q } }
                ]
            },
            take: 10,
            include: { project: true }
        });
        return NextResponse.json(tasks);
    } catch (error) {
        return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
}
