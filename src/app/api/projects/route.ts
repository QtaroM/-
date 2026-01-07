import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, description } = await req.json();

        if (!name) {
            return NextResponse.json({ error: "Project name is required" }, { status: 400 });
        }

        // Transaction to create project and add creator as member
        const project = await prisma.$transaction(async (tx) => {
            const p = await tx.project.create({
                data: {
                    name,
                    description,
                    createdById: session.userId,
                },
            });

            await tx.projectMember.create({
                data: {
                    projectId: p.id,
                    userId: session.userId,
                    role: "owner",
                },
            });

            return p;
        });

        return NextResponse.json(project);
    } catch (error) {
        console.error("Create project error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
