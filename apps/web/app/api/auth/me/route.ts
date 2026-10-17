import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../lib/auth";
import { db, users, profiles, mealPlans, sql } from "@simplefit/database";

export async function GET(req: NextRequest) {
  try {
    // Check Authorization header or cookie
    const authHeader = req.headers.get("authorization");
    let token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    if (!token) {
      token = req.cookies.get("simplefit_token")?.value || null;
    }

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const userList = await db
      .select({ id: users.id, email: users.email, name: users.name, role: users.role })
      .from(users)
      .where(sql`${users.id} = ${payload.userId}`)
      .limit(1);

    if (userList.length === 0) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const user = userList[0];

    // Fetch latest profile
    const profile = (
      await db
        .select()
        .from(profiles)
        .where(sql`${profiles.userId} = ${user.id}`)
        .orderBy(sql`${profiles.createdAt} DESC`)
        .limit(1)
    )[0] || null;

    // Fetch active meal plan
    const activeMealPlan = (
      await db
        .select()
        .from(mealPlans)
        .where(sql`${mealPlans.userId} = ${user.id} AND ${mealPlans.isActive} = 'true'`)
        .orderBy(sql`${mealPlans.createdAt} DESC`)
        .limit(1)
    )[0] || null;

    return NextResponse.json({
      authenticated: true,
      user,
      profile,
      activeMealPlan,
    });
  } catch (err: unknown) {
    console.error("Auth Me Error:", err);
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }
}
