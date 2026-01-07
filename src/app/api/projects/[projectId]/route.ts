import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { projectId } = await params;

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                members: { include: { user: true } },
                tasks: { include: { assignees: { include: { user: true } } } },
            },
        });

        if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

        // Check if user is member
        const isMember = project.members.some(m => m.userId === session.userId);
        if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        return NextResponse.json(project);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { projectId } = await params;

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { members: true }
        });

        if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

        // Only creator/owner can delete
        // We simplified roles to just 'member' in initial implementation but let's check createdById
        // Additionally check if there is an explicit 'owner' role in ProjectMember if we used it
        // The schema has `role` field in `ProjectMember`.

        const membership = project.members.find(m => m.userId === session.userId);
        const isOwner = project.createdById === session.userId || membership?.role === "owner";

        if (!isOwner) {
            return NextResponse.json({ error: "Only project owner can delete this project" }, { status: 403 });
        }

        await prisma.project.delete({
            where: { id: projectId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete project error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
