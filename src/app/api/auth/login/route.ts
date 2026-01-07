import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { comparePassword, signToken, setSession } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "メールアドレスとパスワードを入力してください" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { error: "メールアドレスまたはパスワードが間違っています" },
                { status: 401 }
            );
        }

        const isValid = await comparePassword(password, user.passwordHash);

        if (!isValid) {
            return NextResponse.json(
                { error: "メールアドレスまたはパスワードが間違っています" },
                { status: 401 }
            );
        }

        const token = await signToken({ userId: user.id, email: user.email });
        await setSession(token);

        return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "ログイン中にエラーが発生しました" },
            { status: 500 }
        );
    }
}
