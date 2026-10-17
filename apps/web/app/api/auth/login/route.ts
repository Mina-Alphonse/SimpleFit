import { NextRequest, NextResponse } from "next/server";
import { db, users, sql } from "@simplefit/database";
import { verifyPassword, signAccessToken, signRefreshToken } from "../../../../lib/auth";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation Error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const userList = await db
      .select()
      .from(users)
      .where(sql`${users.email} = ${email.toLowerCase().trim()}`)
      .limit(1);

    if (userList.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = userList[0];

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Account was created with OAuth. Please continue with Google." },
        { status: 400 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens: { accessToken, refreshToken },
    });

    response.cookies.set("simplefit_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    console.error("Login Error:", err);
    return NextResponse.json(
      { error: "Authentication failed", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
