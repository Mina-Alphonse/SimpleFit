import { NextRequest, NextResponse } from "next/server";
import { db, users, sql } from "@simplefit/database";
import { hashPassword, signAccessToken, signRefreshToken } from "../../../../lib/auth";
import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation Error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;

    // Check if email already registered
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`${users.email} = ${email.toLowerCase().trim()}`)
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email already registered. Please sign in." },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        email: email.toLowerCase().trim(),
        name: name || email.split("@")[0],
        passwordHash,
        role: "user",
      })
      .returning();

    const payload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };

    const accessToken = await signAccessToken(payload);
    const refreshToken = await signRefreshToken(payload);

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      tokens: { accessToken, refreshToken },
    });

    // Set secure HTTP-only cookie
    response.cookies.set("simplefit_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15, // 15 mins
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    console.error("Register Error:", err);
    return NextResponse.json(
      { error: "Failed to register user", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
