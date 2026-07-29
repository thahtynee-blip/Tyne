"use client";

import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const { loggedInUser, loginUser, registerUser, isClient } = useContext(AppContext);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("login"); // "login" or "register"

  // Login Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register Form States
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirm, setRegisterConfirm] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (loggedInUser) {
      if (loggedInUser.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/profile");
      }
    }
  }, [loggedInUser]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      alert("Vui lòng điền đầy đủ email và mật khẩu!");
      return;
    }

    const role = loginUser(loginEmail.trim(), loginPassword);
    if (role === "admin") {
      router.push("/admin");
    } else if (role === "user") {
      router.push("/profile");
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();

    // Validations
    if (!registerName.trim()) {
      alert("Họ tên không được để trống!");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerEmail.trim())) {
      alert("Địa chỉ email không hợp lệ!");
      return;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(registerPhone.trim())) {
      alert("Số điện thoại phải đủ 10 chữ số!");
      return;
    }
    if (registerPassword.length < 6) {
      alert("Mật khẩu phải chứa ít nhất 6 ký tự!");
      return;
    }
    if (registerPassword !== registerConfirm) {
      alert("Xác nhận mật khẩu không khớp!");
      return;
    }
    if (!agreeTerms) {
      alert("Bạn phải đồng ý với Điều khoản & Chính sách!");
      return;
    }

    const success = registerUser({
      name: registerName.trim(),
      email: registerEmail.trim(),
      phone: registerPhone.trim(),
      password: registerPassword,
      address: ""
    });

    if (success) {
      router.push("/profile");
    }
  };

  return (
    <main className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", padding: "40px 24px" }}>
      <div className="auth-card" style={{ background: "#fff", width: "100%", maxWidth: "480px", padding: "40px", borderRadius: "var(--border-radius-lg)", border: "1px solid rgba(0,0,0,0.04)", boxShadow: "var(--shadow-lg)" }}>
        
        {/* Auth Title Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "8px" }}>
            {activeTab === "login" ? "Chào Mừng Trở Lại" : "Tạo Tài Khoản Mới"}
          </h2>
          <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
            {activeTab === "login"
              ? "Đăng nhập tài khoản MiniShop của bạn để tiếp tục"
              : "Đăng ký thành viên để khám phá thế giới đồ thủ công tinh tế"}
          </p>
        </div>

        {/* Tab switcher header buttons */}
        <div className="auth-tabs" style={{ display: "flex", borderBottom: "2px solid rgba(0,0,0,0.05)", marginBottom: "28px", gap: "20px" }}>
          <button
            className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
            style={{ flex: 1, paddingBottom: "12px", background: "none", border: "none", fontSize: "1.05rem", fontWeight: "600", color: activeTab === "login" ? "var(--primary-color)" : "var(--text-muted)", borderBottom: activeTab === "login" ? "3px solid var(--primary-color)" : "3px solid transparent", cursor: "pointer", transition: "all 0.2s" }}
          >
            Đăng Nhập
          </button>
          <button
            className={`auth-tab ${activeTab === "register" ? "active" : ""}`}
            onClick={() => setActiveTab("register")}
            style={{ flex: 1, paddingBottom: "12px", background: "none", border: "none", fontSize: "1.05rem", fontWeight: "600", color: activeTab === "register" ? "var(--primary-color)" : "var(--text-muted)", borderBottom: activeTab === "register" ? "3px solid var(--primary-color)" : "3px solid transparent", cursor: "pointer", transition: "all 0.2s" }}
          >
            Đăng Ký
          </button>
        </div>

        {/* Form rendering */}
        {activeTab === "login" ? (
          /* LOGIN FORM */
          <form className="auth-form" onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="form-group">
              <label htmlFor="login-email">Địa chỉ Email</label>
              <div className="form-input-wrapper" style={{ position: "relative" }}>
                <i className="fa-regular fa-envelope" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}></i>
                <input
                  type="email"
                  id="login-email"
                  className="form-control"
                  style={{ width: "100%", padding: "12px 16px 12px 46px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "var(--border-radius-sm)", outline: "none" }}
                  placeholder="name@domain.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Mật khẩu</label>
              <div className="form-input-wrapper" style={{ position: "relative" }}>
                <i className="fa-solid fa-lock" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}></i>
                <input
                  type="password"
                  id="login-password"
                  className="form-control"
                  style={{ width: "100%", padding: "12px 16px 12px 46px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "var(--border-radius-sm)", outline: "none" }}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit-btn" style={{ width: "100%", padding: "14px", fontWeight: "600", fontSize: "1rem" }}>
              Đăng Nhập Ngay
            </button>
            
            <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Tài khoản Admin thử nghiệm: <strong>test@minishop.com</strong> / Mật khẩu: <strong>123456</strong>
            </p>
          </form>
        ) : (
          /* REGISTER FORM */
          <form className="auth-form" onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="form-group">
              <label htmlFor="register-name">Họ và Tên</label>
              <div className="form-input-wrapper" style={{ position: "relative" }}>
                <i className="fa-regular fa-user" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}></i>
                <input
                  type="text"
                  id="register-name"
                  className="form-control"
                  style={{ width: "100%", padding: "12px 16px 12px 46px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "var(--border-radius-sm)", outline: "none" }}
                  placeholder="Nguyễn Văn A"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-email">Địa chỉ Email</label>
              <div className="form-input-wrapper" style={{ position: "relative" }}>
                <i className="fa-regular fa-envelope" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}></i>
                <input
                  type="email"
                  id="register-email"
                  className="form-control"
                  style={{ width: "100%", padding: "12px 16px 12px 46px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "var(--border-radius-sm)", outline: "none" }}
                  placeholder="email@example.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-phone">Số Điện Thoại</label>
              <div className="form-input-wrapper" style={{ position: "relative" }}>
                <i className="fa-solid fa-phone" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}></i>
                <input
                  type="tel"
                  id="register-phone"
                  className="form-control"
                  style={{ width: "100%", padding: "12px 16px 12px 46px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "var(--border-radius-sm)", outline: "none" }}
                  placeholder="0987654321"
                  value={registerPhone}
                  onChange={(e) => setRegisterPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-password">Mật khẩu</label>
              <div className="form-input-wrapper" style={{ position: "relative" }}>
                <i className="fa-solid fa-lock" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}></i>
                <input
                  type="password"
                  id="register-password"
                  className="form-control"
                  style={{ width: "100%", padding: "12px 16px 12px 46px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "var(--border-radius-sm)", outline: "none" }}
                  placeholder="Tối thiểu 6 ký tự"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="register-confirm">Xác nhận mật khẩu</label>
              <div className="form-input-wrapper" style={{ position: "relative" }}>
                <i className="fa-solid fa-lock" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}></i>
                <input
                  type="password"
                  id="register-confirm"
                  className="form-control"
                  style={{ width: "100%", padding: "12px 16px 12px 46px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "var(--border-radius-sm)", outline: "none" }}
                  placeholder="Nhập lại mật khẩu"
                  value={registerConfirm}
                  onChange={(e) => setRegisterConfirm(e.target.value)}
                  required
                />
              </div>
            </div>

            <label style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "0.85rem", cursor: "pointer", color: "var(--text-muted)" }}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={{ width: "16px", height: "16px", accentColor: "var(--primary-color)" }}
                required
              />
              Tôi đồng ý với các Điều khoản & Chính sách của MiniShop
            </label>

            <button type="submit" className="btn btn-primary auth-submit-btn" style={{ width: "100%", padding: "14px", fontWeight: "600", fontSize: "1rem" }}>
              Đăng Ký Tài Khoản
            </button>
          </form>
        )}

      </div>
    </main>
  );
}
