import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";

export async function POST(req) {
  const { userId, username, email } = await req.json();

  if (!userId || !email) {
    return NextResponse.json({ success: false, error: "Data tidak lengkap" }, { status: 400 });
  }

  try {
    await db.insert(schema.users).values({
      id: userId,
      username: username || email.split("@")[0],
      email,
      kasta: "rakyat",
      level: 1,
      exp: 0,
      keyBalance: 4, // starter key biar bisa langsung nonton beberapa episode
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    // kemungkinan sudah ada (race condition) - anggap sukses
    return NextResponse.json({ success: true, note: err.message });
  }
}
