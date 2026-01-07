import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signToken, setSession } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "必須項目が不足しています" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "このメールアドレスは既に登録されています" },
                { status: 400 }
            );
        }

        const passwordHash = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
            },
        });

        const token = await signToken({ userId: user.id, email: user.email });
        await setSession(token);

        return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { error: "アカウント作成中にエラーが発生しました" },
            { status: 500 }
        );
    }
}
