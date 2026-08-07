import { NextResponse } from "next/server";
import { prisma } from "../../../../utils/prisma";
import crypto from "crypto";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(request) {
  try {
    const { userId, userEmail, userName, content } = await request.json();

    if (!userId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    // 1. Admin Handoff Check
    // Fetch recent 5 messages involving this user
    const recentMessages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // Check if human admin has replied within 10 minutes
    const humanAdminRepliedRecently = recentMessages.some(m => {
      const isHumanAdmin = m.senderId !== userId && m.senderId !== "ai-assistant";
      return isHumanAdmin && new Date(m.createdAt) > tenMinutesAgo;
    });

    if (humanAdminRepliedRecently) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "Human admin is actively conversing with customer"
      });
    }

    // 2. Fetch Product Catalog to build RAG Context
    const products = await prisma.product.findMany({
      orderBy: { id: "asc" }
    });

    const productsCatalogText = products.map(p => 
      `- ${p.name} (Giá: ${p.price.toLocaleString("vi-VN")}đ, Danh mục: ${p.categoryName || p.category}): ${p.description || "Sản phẩm thủ công mỹ nghệ Japandi mộc mạc cao cấp."}`
    ).join("\n");

    // 3. System Prompt Definition
    const systemPrompt = `Bạn là Trợ lý AI bán hàng thông minh của MiniShop (Cửa hàng chuyên cung cấp đồ thủ công mỹ nghệ, đồ gốm và nội thất mộc mạc phong cách Japandi).

PHONG CÁCH TƯ VẤN:
- Luôn xưng "MiniShop" và gọi khách hàng là "dạ/bạn/anh/chị".
- Thân thiện, chu đáo, nhiệt tình, tư vấn ngắn gọn cô đọng trong 2-4 câu.
- Dựa vào DANH SÁCH SẢN PHẨM HIỆN CÓ bên dưới để báo giá chính xác và gợi ý sản phẩm phù hợp khi khách hỏi.

DANH SÁCH SẢN PHẨM CỬA HÀNG MINISHOP:
${productsCatalogText}`;

    // 4. Call Google Gemini Flash Lite API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;
    
    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\nKhách hàng (${userName || "Khách"}): ${content}` }]
          }
        ]
      })
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", errText);
      return NextResponse.json({ error: "Failed to generate AI response" }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const aiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Dạ MiniShop xin chào bạn! Hiện tại shop đang sẵn sàng hỗ trợ tư vấn các sản phẩm thủ công, bạn cần tìm sản phẩm nào ạ?";

    // 5. Save AI message to Supabase DB Message table
    const aiMessageRecord = await prisma.message.create({
      data: {
        id: crypto.randomUUID(),
        senderId: "ai-assistant",
        senderEmail: "ai@minishop.vn",
        senderName: "Trợ Lý AI MiniShop",
        receiverId: userId,
        content: aiText
      }
    });

    return NextResponse.json({
      success: true,
      aiMessage: aiMessageRecord
    });
  } catch (error) {
    console.error("AI Chat API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
