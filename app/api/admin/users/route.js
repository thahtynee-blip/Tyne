import { NextResponse } from "next/server";
import { prisma } from "../../../../utils/prisma";

export async function DELETE(request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Xóa từ bảng public.Profile trước
    await prisma.profile.delete({
      where: { id: userId },
    });

    // Thực thi SQL thô để xóa vĩnh viễn khỏi bảng auth.users của Supabase
    await prisma.$executeRawUnsafe(
      'DELETE FROM auth.users WHERE id = $1',
      userId
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
