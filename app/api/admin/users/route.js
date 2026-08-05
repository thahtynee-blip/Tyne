import { NextResponse } from "next/server";
import { prisma } from "../../../../utils/prisma";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request) {
  try {
    const { email, password, name, phone, address, role } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email và mật khẩu là bắt buộc!" }, { status: 400 });
    }

    // 1. Tạo tài khoản trong Supabase Auth bằng API Admin
    const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, phone, address }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const user = data.user;

    // 2. Chèn thông tin vào bảng Profile
    const profile = await prisma.profile.create({
      data: {
        id: user.id,
        email: user.email,
        name: name || "",
        phone: phone || "",
        address: address || "",
        role: role || "user"
      }
    });

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error("Create user API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Xóa trong bảng Profile
    await prisma.profile.delete({
      where: { id: userId },
    });

    // Xóa trong bảng auth.users bằng Admin API của Supabase
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      console.warn("Auth delete failed or already deleted:", authError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
