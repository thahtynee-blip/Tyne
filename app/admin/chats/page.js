"use client";

import React, { useContext, useEffect, useState, useRef } from "react";
import { AppContext } from "../../../context/AppContext";
import { createClient } from "../../../utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const supabase = createClient();

export default function AdminChatsManagement() {
  const { isClient, authLoading, loggedInUser, logoutUser } = useContext(AppContext);
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const chatContainerRef = useRef(null);

  // Auth protection for Admin
  useEffect(() => {
    if (isClient && !authLoading) {
      if (!loggedInUser || loggedInUser.role !== "admin") {
        alert("Quyền truy cập bị từ chối. Chỉ dành cho Quản trị viên.");
        router.push("/login");
      }
    }
  }, [loggedInUser, isClient, authLoading, router]);

  // Fetch all chat messages & subscribe to Realtime
  useEffect(() => {
    if (!isClient || authLoading || !loggedInUser || loggedInUser.role !== "admin") return;

    const fetchAllMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("Message")
          .select("*")
          .order("createdAt", { ascending: true });

        if (!error && data) {
          setMessages(data);
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchAllMessages();

    // Subscribe to all new message inserts
    const channel = supabase
      .channel("admin-global-chats")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
        },
        (payload) => {
          const newMsg = payload.new;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isClient, loggedInUser]);

  // Auto scroll chat box internally without jumping the browser page
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, selectedCustomerId]);

  if (!isClient || authLoading || !loggedInUser || loggedInUser.role !== "admin") {
    return (
      <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>
        Đang tải trang tin nhắn hỗ trợ...
      </div>
    );
  }

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  // Group conversations by customer
  // A customer is any user who sent a message, or received a message from Admin/AI
  const customersMap = {};
  messages.forEach((msg) => {
    let custId, custEmail, custName;

    if (msg.senderId !== loggedInUser.id && msg.senderId !== "admin" && msg.senderId !== "ai-assistant") {
      custId = msg.senderId;
      custEmail = msg.senderEmail;
      custName = msg.senderName;
    } else if (msg.receiverId !== "admin" && msg.receiverId !== loggedInUser.id) {
      custId = msg.receiverId;
      custEmail = msg.receiverId; // fallback
      custName = "Khách hàng";
    }

    if (custId) {
      if (!customersMap[custId]) {
        customersMap[custId] = {
          id: custId,
          email: custEmail,
          name: custName || custEmail?.split("@")[0] || "Khách hàng",
          lastMessage: msg.content,
          lastTime: msg.createdAt,
        };
      } else {
        customersMap[custId].lastMessage = msg.content;
        customersMap[custId].lastTime = msg.createdAt;
      }
    }
  });

  const customerList = Object.values(customersMap).sort(
    (a, b) => new Date(b.lastTime) - new Date(a.lastTime)
  );

  // Set default selected customer if none chosen
  const activeCustomer =
    customerList.find((c) => c.id === selectedCustomerId) || customerList[0];

  // Filter messages for active customer conversation (including AI Assistant replies)
  const currentConversation = activeCustomer
    ? messages.filter(
        (m) =>
          m.senderId === activeCustomer.id ||
          m.receiverId === activeCustomer.id
      )
    : [];

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeCustomer) return;

    const content = replyText.trim();
    setReplyText("");

    const newMsg = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      senderId: loggedInUser.id,
      senderEmail: loggedInUser.email,
      senderName: `Admin (${loggedInUser.name})`,
      receiverId: activeCustomer.id,
      content: content,
      createdAt: new Date().toISOString()
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, newMsg]);

    try {
      const { error } = await supabase.from("Message").insert(newMsg);
      if (error) {
        console.error("Error sending admin reply to Supabase:", error);
      }
    } catch (err) {
      console.error("Failed to send admin reply:", err);
    }
  };

  return (
    <div className="admin-layout" style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "90vh" }}>
      
      {/* Admin Sidebar */}
      <aside className="admin-sidebar" style={{ background: "#2C3E50", color: "#fff", padding: "30px 20px", display: "flex", flexDirection: "column", gap: "30px" }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: "700", color: "#ecf0f1", margin: "0 0 10px 0" }}>
            <span style={{ color: "var(--primary-color)" }}>Mini</span>Shop Admin
          </h2>
          <p style={{ fontSize: "0.8rem", color: "#bdc3c7", margin: 0 }}>Chào, {loggedInUser.name}</p>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
          <Link href="/admin" className="admin-menu-item" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", textDecoration: "none", color: "#ecf0f1", transition: "all 0.2s" }} onMouseOver={(e) => e.target.style.background = "#34495e"} onMouseOut={(e) => e.target.style.background = "none"}>
            <i className="fa-solid fa-chart-pie"></i> Tổng quan & Đơn hàng
          </Link>
          <Link href="/admin/products" className="admin-menu-item" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", textDecoration: "none", color: "#ecf0f1", transition: "all 0.2s" }} onMouseOver={(e) => e.target.style.background = "#34495e"} onMouseOut={(e) => e.target.style.background = "none"}>
            <i className="fa-solid fa-boxes-stacked"></i> Quản lý sản phẩm
          </Link>
          <Link href="/admin/users" className="admin-menu-item" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", textDecoration: "none", color: "#ecf0f1", transition: "all 0.2s" }} onMouseOver={(e) => e.target.style.background = "#34495e"} onMouseOut={(e) => e.target.style.background = "none"}>
            <i className="fa-solid fa-users"></i> Quản lý thành viên
          </Link>
          <Link href="/admin/chats" className="admin-menu-item active" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", textDecoration: "none", color: "#fff", background: "#34495e", fontWeight: "600" }}>
            <i className="fa-solid fa-comments"></i> Tin nhắn hỗ trợ
          </Link>
          <Link href="/" className="admin-menu-item" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", textDecoration: "none", color: "#ecf0f1", transition: "all 0.2s" }} onMouseOver={(e) => e.target.style.background = "#34495e"} onMouseOut={(e) => e.target.style.background = "none"}>
            <i className="fa-solid fa-house"></i> Quay lại Cửa hàng
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", background: "#c0392b", color: "#fff", border: "none", cursor: "pointer", fontWeight: "600", width: "100%" }}
        >
          <i className="fa-solid fa-arrow-right-from-bracket"></i> Đăng xuất
        </button>
      </aside>

      {/* Admin Main Chat Content Area */}
      <main className="admin-content" style={{ padding: "30px", background: "#f8f9fa", display: "flex", flexDirection: "column", height: "calc(100vh - 40px)", overflow: "hidden" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "20px", flexShrink: 0 }}>
          Tin Nhắn Hỗ Trợ Khách Hàng
        </h1>

        {/* Split View Container */}
        <div style={{
          flex: 1,
          minHeight: 0,
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid rgba(0,0,0,0.06)",
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
        }}>
          
          {/* Left Column: Customer Conversations List */}
          <div style={{ borderRight: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", background: "#fff", height: "100%", minHeight: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#fcfcfc", flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "600", color: "var(--text-main)" }}>
                Hội thoại khách hàng ({customerList.length})
              </h3>
            </div>

            <div style={{ flex: 1, overflowY: "auto" }}>
              {customerList.length === 0 ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  <i className="fa-regular fa-comments" style={{ fontSize: "2rem", marginBottom: "10px", opacity: 0.4 }}></i>
                  <p style={{ margin: 0 }}>Chưa có tin nhắn hỗ trợ nào từ khách hàng.</p>
                </div>
              ) : (
                customerList.map((cust) => {
                  const isSelected = activeCustomer?.id === cust.id;
                  return (
                    <div
                      key={cust.id}
                      onClick={() => setSelectedCustomerId(cust.id)}
                      style={{
                        padding: "16px 20px",
                        borderBottom: "1px solid rgba(0,0,0,0.04)",
                        cursor: "pointer",
                        background: isSelected ? "rgba(60,98,85,0.08)" : "transparent",
                        borderLeft: isSelected ? "4px solid var(--primary-color)" : "4px solid transparent",
                        transition: "background 0.2s"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontWeight: "600", fontSize: "0.95rem", color: "var(--text-main)" }}>
                          {cust.name}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {(() => {
                            if (!cust.lastTime) return "";
                            let str = String(cust.lastTime);
                            if (!str.endsWith("Z") && !str.includes("+")) str += "Z";
                            const d = new Date(str);
                            return isNaN(d.getTime()) ? "" : d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" });
                          })()}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                        {cust.email}
                      </div>
                      <div style={{
                        fontSize: "0.85rem",
                        color: "#555",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}>
                        {cust.lastMessage}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Active Conversation Chat Thread */}
          <div style={{ display: "flex", flexDirection: "column", background: "#f9fbfd", height: "100%", minHeight: 0, overflow: "hidden" }}>
            {activeCustomer ? (
              <>
                {/* Chat Header */}
                <div style={{
                  padding: "16px 24px",
                  background: "#fff",
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flexShrink: 0
                }}>
                  <div style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "rgba(60,98,85,0.1)",
                    color: "var(--primary-color)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    fontSize: "1.1rem"
                  }}>
                    {activeCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600", color: "var(--text-main)" }}>
                      {activeCustomer.name}
                    </h3>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                      Email: {activeCustomer.email}
                    </span>
                  </div>
                </div>

                {/* Chat Message List */}
                <div ref={chatContainerRef} style={{ flex: 1, minHeight: 0, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px" }}>
                  {currentConversation.map((msg) => {
                    const isShopMsg = msg.senderId === loggedInUser.id || msg.senderId === "admin" || msg.senderId === "ai-assistant";
                    const isAiMsg = msg.senderId === "ai-assistant";

                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: isShopMsg ? "flex-end" : "flex-start"
                        }}
                      >
                        <span style={{ fontSize: "0.75rem", color: isAiMsg ? "#27ae60" : "var(--text-muted)", marginBottom: "4px", fontWeight: isAiMsg ? "600" : "normal" }}>
                          {isAiMsg ? "🤖 Trợ Lý AI MiniShop" : (msg.senderName || msg.senderEmail)}
                        </span>
                        <div style={{
                          maxWidth: "70%",
                          padding: "12px 18px",
                          borderRadius: isShopMsg ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          background: isAiMsg ? "#e8f5e9" : (isShopMsg ? "var(--primary-color)" : "#fff"),
                          color: isAiMsg ? "#1b5e20" : (isShopMsg ? "#fff" : "var(--text-main)"),
                          border: isAiMsg ? "1px solid #c8e6c9" : "none",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                          fontSize: "0.95rem",
                          lineHeight: "1.4",
                          wordBreak: "break-word"
                        }}>
                          {msg.content}
                        </div>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>
                          {(() => {
                            if (!msg.createdAt) return "";
                            let str = String(msg.createdAt);
                            if (!str.endsWith("Z") && !str.includes("+")) str += "Z";
                            const d = new Date(str);
                            return isNaN(d.getTime()) ? "" : d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" });
                          })()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Input Form */}
                <form onSubmit={handleSendReply} style={{ padding: "16px 24px", background: "#fff", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", gap: "12px", flexShrink: 0 }}>
                  <input
                    type="text"
                    placeholder={`Trả lời ${activeCustomer.name}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "12px 18px",
                      borderRadius: "24px",
                      border: "1px solid rgba(0,0,0,0.12)",
                      outline: "none",
                      fontSize: "0.95rem"
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: "12px 24px",
                      borderRadius: "24px",
                      background: "var(--primary-color)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "0.92rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    <i className="fa-solid fa-paper-plane"></i> Gửi
                  </button>
                </form>
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
                Chọn một hội thoại bên trái để bắt đầu chat.
              </div>
            )}
          </div>

        </div>
      </main>

    </div>
  );
}
