"use client";

import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../context/AppContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminUsersManagement() {
  const {
    isClient,
    loggedInUser,
    logoutUser,
    profiles,
    adminUpdateUserRole
  } = useContext(AppContext);

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Auth protection for Admin
  useEffect(() => {
    if (isClient && (!loggedInUser || loggedInUser.role !== "admin")) {
      alert("Quyền truy cập bị từ chối. Chỉ dành cho Quản trị viên.");
      router.push("/login");
    }
  }, [loggedInUser, isClient]);

  if (!isClient || !loggedInUser || loggedInUser.role !== "admin") {
    return <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>Đang tải trang quản lý thành viên...</div>;
  }

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  const handleRoleToggle = (userId, currentRole, email) => {
    if (userId === loggedInUser.id) {
      alert("Bạn không thể tự hạ quyền hoặc thay đổi vai trò của chính mình!");
      return;
    }

    const targetRole = currentRole === "admin" ? "user" : "admin";
    const confirmMessage = currentRole === "admin"
      ? `Bạn có chắc chắn muốn gỡ quyền quản trị của tài khoản ${email}?`
      : `Bạn có chắc chắn muốn nâng quyền quản trị (Admin) cho tài khoản ${email}?`;

    if (window.confirm(confirmMessage)) {
      adminUpdateUserRole(userId, targetRole);
    }
  };

  // Filter profiles based on search query
  const filteredProfiles = profiles.filter((p) => {
    const nameMatch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = p.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = p.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || emailMatch || phoneMatch;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "Chưa cập nhật";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "Chưa cập nhật" : d.toLocaleDateString("vi-VN");
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
          <Link href="/admin/users" className="admin-menu-item active" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", textDecoration: "none", color: "#fff", background: "#34495e", fontWeight: "600" }}>
            <i className="fa-solid fa-users"></i> Quản lý thành viên
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

      {/* Admin Content Area */}
      <main className="admin-content" style={{ padding: "40px", background: "#f8f9fa" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "30px" }}>Quản Lý Thành Viên</h1>

        {/* Metrics Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px", marginBottom: "40px" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ width: "54px", height: "54px", borderRadius: "12px", background: "rgba(52,152,219,0.1)", color: "#3498db", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Tổng Số Thành Viên</span>
              <h3 style={{ fontSize: "1.35rem", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>{profiles.length} tài khoản</h3>
            </div>
          </div>
        </div>

        {/* Search bar and User List */}
        <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--text-main)", margin: 0 }}>Danh Sách Người Dùng</h2>
            
            {/* Search Input */}
            <div style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
              <input
                type="text"
                placeholder="Tìm theo tên, email, sđt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 16px 10px 40px",
                  borderRadius: "8px",
                  border: "1px solid rgba(0,0,0,0.1)",
                  fontSize: "0.92rem",
                  outline: "none",
                  transition: "all 0.2s"
                }}
              />
              <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "0.9rem" }}></i>
            </div>
          </div>

          {filteredProfiles.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 0", textAlign: "center" }}>
              <i className="fa-solid fa-user-slash" style={{ fontSize: "2.5rem", color: "var(--text-muted)", opacity: 0.4, marginBottom: "12px" }}></i>
              <h3>Không tìm thấy thành viên nào</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Thử thay đổi từ khóa tìm kiếm của bạn.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="orders-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.02)", textAlign: "left" }}>
                    <th style={{ padding: "12px 16px", fontWeight: "600" }}>Thành viên</th>
                    <th style={{ padding: "12px 16px", fontWeight: "600" }}>Thông tin liên hệ</th>
                    <th style={{ padding: "12px 16px", fontWeight: "600" }}>Địa chỉ</th>
                    <th style={{ padding: "12px 16px", fontWeight: "600" }}>Vai trò</th>
                    <th style={{ padding: "12px 16px", fontWeight: "600" }}>Ngày tham gia</th>
                    <th style={{ padding: "12px 16px", fontWeight: "600", textAlign: "center" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfiles.map((user) => (
                    <tr key={user.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      
                      {/* Name & ID */}
                      <td style={{ padding: "16px" }}>
                        <div style={{ fontWeight: "600", color: "var(--text-main)" }}>{user.name || "Khách"}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>ID: {user.id}</div>
                      </td>

                      {/* Contact Info */}
                      <td style={{ padding: "16px" }}>
                        <div style={{ fontWeight: "500" }}>{user.email}</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>SĐT: {user.phone || "Chưa cập nhật"}</div>
                      </td>

                      {/* Address */}
                      <td style={{ padding: "16px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={user.address || "Chưa cập nhật"}>
                        {user.address || "Chưa cập nhật"}
                      </td>

                      {/* Role Badge */}
                      <td style={{ padding: "16px" }}>
                        <span className={`status-badge ${user.role}`} style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          background: user.role === "admin" ? "rgba(231,76,60,0.1)" : "rgba(46,204,113,0.1)",
                          color: user.role === "admin" ? "#e74c3c" : "#2ecc71"
                        }}>
                          {user.role === "admin" ? "Admin" : "User"}
                        </span>
                      </td>

                      {/* Date Joined */}
                      <td style={{ padding: "16px" }}>{formatDate(user.createdAt)}</td>

                      {/* Actions */}
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <button
                          onClick={() => handleRoleToggle(user.id, user.role, user.email)}
                          disabled={user.id === loggedInUser.id}
                          className="btn"
                          style={{
                            padding: "6px 12px",
                            fontSize: "0.8rem",
                            background: user.role === "admin" ? "#95a5a6" : "var(--primary-color)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: user.id === loggedInUser.id ? "not-allowed" : "pointer",
                            opacity: user.id === loggedInUser.id ? 0.6 : 1,
                            fontWeight: "600",
                            transition: "background 0.2s"
                          }}
                        >
                          {user.role === "admin" ? "Gỡ Admin" : "Lên Admin"}
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
