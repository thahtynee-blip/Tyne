"use client";

import React, { useState, useEffect, useContext, useRef } from "react";
import { AppContext } from "../context/AppContext";
import { createClient } from "../utils/supabase/client";
import Link from "next/link";

const supabase = createClient();

export default function ChatWidget() {
  const { isClient, loggedInUser } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isClient || !loggedInUser || loggedInUser.role === "admin") return;

    // Fetch initial chat messages for this user
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("Message")
          .select("*")
          .or(`senderId.eq.${loggedInUser.id},receiverId.eq.${loggedInUser.id}`)
          .order("createdAt", { ascending: true });

        if (!error && data) {
          setMessages(data);
        }
      } catch (err) {
        console.error("Error fetching chat messages:", err);
      }
    };

    fetchMessages();

    // Subscribe to Supabase Realtime for new messages
    const channel = supabase
      .channel(`user-chat-${loggedInUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
        },
        (payload) => {
          const newMsg = payload.new;
          if (
            newMsg.senderId === loggedInUser.id ||
            newMsg.receiverId === loggedInUser.id
          ) {
            setMessages((prev) => {
              // Avoid duplicate messages
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });

            if (newMsg.senderId !== loggedInUser.id && !isOpen) {
              setUnreadCount((prev) => prev + 1);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isClient, loggedInUser, isOpen]);

  // Reset unread count when opening chat
  const handleToggleOpen = () => {
    if (!isOpen) {
      setUnreadCount(0);
    }
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !loggedInUser) return;

    const content = inputText.trim();
    setInputText("");

    const newMsg = {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      senderId: loggedInUser.id,
      senderEmail: loggedInUser.email,
      senderName: loggedInUser.name || loggedInUser.email.split("@")[0],
      receiverId: "admin",
      content: content,
      createdAt: new Date().toISOString()
    };

    // Optimistic UI update
    setMessages((prev) => [...prev, newMsg]);

    try {
      const { error } = await supabase.from("Message").insert(newMsg);
      if (error) {
        console.error("Error sending message to Supabase:", error);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // Hide widget completely for admin users or during SSR
  if (!isClient || loggedInUser?.role === "admin") {
    return null;
  }

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999 }}>
      {/* Closed Floating Button */}
      {!isOpen && (
        <button
          onClick={handleToggleOpen}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "var(--primary-color)",
            color: "#fff",
            border: "none",
            boxShadow: "0 8px 24px rgba(60,98,85,0.35)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            position: "relative",
            transition: "transform 0.2s"
          }}
          aria-label="Mở khung chat hỗ trợ"
        >
          <i className="fa-solid fa-comments"></i>
          {unreadCount > 0 && (
            <span style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              background: "#e74c3c",
              color: "#fff",
              borderRadius: "50%",
              width: "22px",
              height: "22px",
              fontSize: "0.75rem",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #fff"
            }}>
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Open Chat Popup Box */}
      {isOpen && (
        <div style={{
          width: "360px",
          height: "480px",
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 12px 36px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.06)",
          animation: "fadeIn 0.2s ease"
        }}>
          {/* Header */}
          <div style={{
            background: "var(--primary-color)",
            color: "#fff",
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ position: "relative" }}>
                <i className="fa-solid fa-headset" style={{ fontSize: "1.4rem" }}></i>
                <span style={{
                  position: "absolute",
                  bottom: "-2px",
                  right: "-2px",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#2ecc71",
                  border: "2px solid var(--primary-color)"
                }}></span>
              </div>
              <div>
                <h4 style={{ margin: 0, fontWeight: "600", fontSize: "1rem" }}>Hỗ Trợ Khách Hàng</h4>
                <span style={{ fontSize: "0.75rem", opacity: 0.85 }}>Trực tuyến | Trả lời ngay</span>
              </div>
            </div>
            <button
              onClick={handleToggleOpen}
              style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "1.2rem" }}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {/* Body Content */}
          <div style={{ flex: 1, padding: "16px", overflowY: "auto", background: "#f8f9fa", display: "flex", flexDirection: "column", gap: "12px" }}>
            {!loggedInUser ? (
              <div style={{ textAlign: "center", margin: "auto 0", padding: "20px" }}>
                <i className="fa-solid fa-lock" style={{ fontSize: "2rem", color: "var(--text-muted)", marginBottom: "12px" }}></i>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "1rem" }}>Vui lòng đăng nhập</h4>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                  Bạn cần đăng nhập tài khoản để chat và gửi tin nhắn trực tiếp cho Admin.
                </p>
                <Link
                  href="/login"
                  className="btn"
                  style={{
                    display: "inline-block",
                    padding: "8px 20px",
                    background: "var(--primary-color)",
                    color: "#fff",
                    borderRadius: "20px",
                    textDecoration: "none",
                    fontSize: "0.85rem",
                    fontWeight: "600"
                  }}
                >
                  Đăng nhập ngay
                </Link>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: "center", margin: "auto 0", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                <i className="fa-regular fa-paper-plane" style={{ fontSize: "2rem", marginBottom: "10px", opacity: 0.5 }}></i>
                <p style={{ margin: 0 }}>Chào bạn! Hãy gửi câu hỏi hoặc thắc mắc để được Admin tư vấn ngay nhé.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === loggedInUser.id;
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isMe ? "flex-end" : "flex-start",
                    }}
                  >
                    <div style={{
                      maxWidth: "80%",
                      padding: "10px 14px",
                      borderRadius: isMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: isMe ? "var(--primary-color)" : "#fff",
                      color: isMe ? "#fff" : "var(--text-main)",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                      fontSize: "0.9rem",
                      lineHeight: "1.4",
                      wordBreak: "break-word"
                    }}>
                      {msg.content}
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px", padding: "0 4px" }}>
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
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          {loggedInUser && (
            <form onSubmit={handleSendMessage} style={{ padding: "12px 16px", background: "#fff", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px 14px",
                  borderRadius: "20px",
                  border: "1px solid rgba(0,0,0,0.1)",
                  outline: "none",
                  fontSize: "0.9rem"
                }}
              />
              <button
                type="submit"
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: "var(--primary-color)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.9rem"
                }}
              >
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
