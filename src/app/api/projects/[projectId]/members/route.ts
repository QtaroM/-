import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { projectId } = await params;
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: "ユーザーが見つかりません" }, { status: 404 });
        }

        // Check if already a member
        const existingMember = await prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId: user.id,
                },
            },
        });

        if (existingMember) {
            return NextResponse.json({ error: "このユーザーは既にメンバーです" }, { status: 400 });
        }

        // Add as member
        const member = await prisma.projectMember.create({
            data: {
                projectId,
                userId: user.id,
                role: "member",
            },
            include: {
                user: true,
            },
        });

        return NextResponse.json(member);
    } catch (error) {
        console.error("Add member error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { projectId } = await params;
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // Cannot remove yourself
        if (userId === session.userId) {
            return NextResponse.json({ error: "自分自身は削除できません" }, { status: 400 });
        }

        await prisma.projectMember.delete({
            where: {
                projectId_userId: {
                    projectId,
                    userId,
                },
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Remove member error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
