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
    adminUpdateUserProfile,
    adminDeleteUser,
    adminCreateUser
  } = useContext(AppContext);

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Edit User States
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editRole, setEditRole] = useState("user");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Create User States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createName, setCreateName] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createAddress, setCreateAddress] = useState("");
  const [createRole, setCreateRole] = useState("user");

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

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditName(user.name || "");
    setEditPhone(user.phone || "");
    setEditAddress(user.address || "");
    setEditRole(user.role || "user");
    setIsModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      alert("Họ tên không được để trống!");
      return;
    }
    const success = await adminUpdateUserProfile(editingUser.id, {
      name: editName.trim(),
      phone: editPhone.trim(),
      address: editAddress.trim(),
      role: editRole
    });
    if (success) {
      setIsModalOpen(false);
      setEditingUser(null);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createEmail.trim() || !createPassword) {
      alert("Email và mật khẩu không được để trống!");
      return;
    }
    if (createPassword.length < 6) {
      alert("Mật khẩu phải chứa ít nhất 6 ký tự!");
      return;
    }

    const success = await adminCreateUser({
      email: createEmail.trim(),
      password: createPassword,
      name: createName.trim(),
      phone: createPhone.trim(),
      address: createAddress.trim(),
      role: createRole
    });

    if (success) {
      setIsCreateModalOpen(false);
      setCreateEmail("");
      setCreatePassword("");
      setCreateName("");
      setCreatePhone("");
      setCreateAddress("");
      setCreateRole("user");
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (userId === loggedInUser.id) {
      alert("Bạn không thể tự xóa tài khoản quản trị của chính mình!");
      return;
    }

    const confirmMessage = `Bạn có chắc chắn muốn xóa VĨNH VIỄN tài khoản ${email}?\nHành động này sẽ xóa sạch thông tin đăng nhập và cơ sở dữ liệu trên Supabase và không thể khôi phục!`;
    
    if (window.confirm(confirmMessage)) {
      await adminDeleteUser(userId);
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
          <Link href="/admin/chats" className="admin-menu-item" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", textDecoration: "none", color: "#ecf0f1", transition: "all 0.2s" }} onMouseOver={(e) => e.target.style.background = "#34495e"} onMouseOut={(e) => e.target.style.background = "none"}>
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

      {/* Admin Content Area */}
      <main className="admin-content" style={{ padding: "40px", background: "#f8f9fa" }}>
        
        {/* Header Title and Add User Button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>Quản Lý Thành Viên</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn"
            style={{
              padding: "10px 18px",
              background: "var(--primary-color)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <i className="fa-solid fa-user-plus"></i> Thêm thành viên
          </button>
        </div>

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

                      {/* Actions (Edit and Delete) */}
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          <button
                            onClick={() => openEditModal(user)}
                            className="btn"
                            style={{
                              padding: "6px 12px",
                              background: "var(--primary-color)",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.82rem",
                              fontWeight: "600",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px"
                            }}
                          >
                            <i className="fa-solid fa-pen-to-square"></i> Sửa
                          </button>
                          
                          <button
                            onClick={() => handleDeleteUser(user.id, user.email)}
                            disabled={user.id === loggedInUser.id}
                            className="btn"
                            style={{
                              padding: "6px 12px",
                              background: "#e74c3c",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              cursor: user.id === loggedInUser.id ? "not-allowed" : "pointer",
                              opacity: user.id === loggedInUser.id ? 0.5 : 1,
                              fontSize: "0.82rem",
                              fontWeight: "600",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px"
                            }}
                          >
                            <i className="fa-solid fa-trash-can"></i> Xóa
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>

      {/* Create User Modal Overlay */}
      {isCreateModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "500px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.08)", paddingBottom: "14px" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>
                Thêm Thành Viên Mới
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "var(--text-muted)" }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              
              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>Email tài khoản *</label>
                <input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="Viết email đăng nhập (ví dụ: test@gmail.com)"
                  required
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid rgba(0,0,0,0.15)",
                    outline: "none",
                    fontSize: "0.9rem"
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>Mật khẩu đăng nhập *</label>
                <input
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  required
                  minLength={6}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid rgba(0,0,0,0.15)",
                    outline: "none",
                    fontSize: "0.9rem"
                  }}
                />
              </div>

              {/* Name */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>Họ và tên</label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Nhập họ và tên"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid rgba(0,0,0,0.15)",
                    outline: "none",
                    fontSize: "0.9rem"
                  }}
                />
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>Số điện thoại</label>
                <input
                  type="text"
                  value={createPhone}
                  onChange={(e) => setCreatePhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid rgba(0,0,0,0.15)",
                    outline: "none",
                    fontSize: "0.9rem"
                  }}
                />
              </div>

              {/* Address */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>Địa chỉ</label>
                <input
                  type="text"
                  value={createAddress}
                  onChange={(e) => setCreateAddress(e.target.value)}
                  placeholder="Nhập địa chỉ giao hàng"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid rgba(0,0,0,0.15)",
                    outline: "none",
                    fontSize: "0.9rem"
                  }}
                />
              </div>

              {/* Role Select */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "4px" }}>Vai trò hệ thống</label>
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid rgba(0,0,0,0.15)",
                    outline: "none",
                    background: "#fff",
                    cursor: "pointer",
                    fontSize: "0.9rem"
                  }}
                >
                  <option value="user">User (Khách hàng)</option>
                  <option value="admin">Admin (Quản trị viên)</option>
                </select>
              </div>

              {/* Actions Footer */}
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "10px", borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{
                    padding: "9px 16px",
                    background: "#f1f2f6",
                    color: "var(--text-main)",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "0.85rem"
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "9px 16px",
                    background: "var(--primary-color)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "0.85rem"
                  }}
                >
                  Tạo tài khoản
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal Overlay */}
      {isModalOpen && editingUser && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#fff",
            padding: "30px",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "500px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.08)", paddingBottom: "14px" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>
                Chỉnh Sửa Thành Viên
              </h3>
              <button
                onClick={() => { setIsModalOpen(false); setEditingUser(null); }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "var(--text-muted)" }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Email (Readonly) */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>Email tài khoản</label>
                <input
                  type="email"
                  value={editingUser.email}
                  disabled
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "1px solid rgba(0,0,0,0.08)",
                    background: "#f9f9f9",
                    color: "#7f8c8d",
                    cursor: "not-allowed",
                    fontSize: "0.92rem"
                  }}
                />
              </div>

              {/* Name */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>Họ và tên *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nhập họ tên"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "1px solid rgba(0,0,0,0.15)",
                    outline: "none",
                    fontSize: "0.92rem"
                  }}
                />
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>Số điện thoại</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Nhập số điện thoại"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "1px solid rgba(0,0,0,0.15)",
                    outline: "none",
                    fontSize: "0.92rem"
                  }}
                />
              </div>

              {/* Address */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>Địa chỉ</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Nhập địa chỉ nhận hàng"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "1px solid rgba(0,0,0,0.15)",
                    outline: "none",
                    fontSize: "0.92rem"
                  }}
                />
              </div>

              {/* Role Select */}
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>Vai trò hệ thống</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  disabled={editingUser.id === loggedInUser.id}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "1px solid rgba(0,0,0,0.15)",
                    outline: "none",
                    background: "#fff",
                    cursor: editingUser.id === loggedInUser.id ? "not-allowed" : "pointer",
                    fontSize: "0.92rem"
                  }}
                >
                  <option value="user">User (Khách hàng)</option>
                  <option value="admin">Admin (Quản trị viên)</option>
                </select>
                {editingUser.id === loggedInUser.id && (
                  <span style={{ fontSize: "0.75rem", color: "#e74c3c", marginTop: "4px", display: "block" }}>
                    Bạn không thể thay đổi vai trò của chính mình.
                  </span>
                )}
              </div>

              {/* Actions Footer */}
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "10px", borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingUser(null); }}
                  style={{
                    padding: "10px 18px",
                    background: "#f1f2f6",
                    color: "var(--text-main)",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "0.9rem"
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 18px",
                    background: "var(--primary-color)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "0.9rem"
                  }}
                >
                  Lưu thay đổi
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
