"use client";

import React, { useContext, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
  const {
    isClient,
    loggedInUser,
    logoutUser,
    products,
    users,
    orders,
    adminCycleOrderStatus
  } = useContext(AppContext);

  const router = useRouter();

  // Auth protection for Admin
  useEffect(() => {
    if (isClient && (!loggedInUser || loggedInUser.role !== "admin")) {
      alert("Quyền truy cập bị từ chối. Chỉ dành cho Quản trị viên.");
      router.push("/login");
    }
  }, [loggedInUser, isClient]);

  if (!isClient || !loggedInUser || loggedInUser.role !== "admin") {
    return <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>Đang tải trang quản trị...</div>;
  }

  // --- Metrics Calculations ---
  // Count revenue of completed orders, or all orders
  const completedOrders = orders.filter(o => o.status === "completed");
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  const formatPrice = (amount) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  const handleLogout = () => {
    logoutUser();
    router.push("/");
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
          <Link href="/admin" className="admin-menu-item active" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", textDecoration: "none", color: "#fff", background: "#34495e", fontWeight: "600" }}>
            <i className="fa-solid fa-chart-pie"></i> Tổng quan & Đơn hàng
          </Link>
          <Link href="/admin/products" className="admin-menu-item" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", textDecoration: "none", color: "#ecf0f1", transition: "all 0.2s" }} onMouseOver={(e) => e.target.style.background = "#34495e"} onMouseOut={(e) => e.target.style.background = "none"}>
            <i className="fa-solid fa-boxes-stacked"></i> Quản lý sản phẩm
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
        <h1 style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "30px" }}>Bảng Tổng Quan Quản Trị</h1>

        {/* Metrics Grid Row */}
        <div className="admin-metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px", marginBottom: "40px" }}>
          
          <div className="metric-card" style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: "20px" }}>
            <div className="metric-icon" style={{ width: "54px", height: "54px", borderRadius: "12px", background: "rgba(46,204,113,0.1)", color: "#2ecc71", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
              <i className="fa-solid fa-money-bill-trend-up"></i>
            </div>
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Doanh thu (Tổng)</span>
              <h3 style={{ fontSize: "1.35rem", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>{formatPrice(totalRevenue)}</h3>
            </div>
          </div>

          <div className="metric-card" style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: "20px" }}>
            <div className="metric-icon" style={{ width: "54px", height: "54px", borderRadius: "12px", background: "rgba(52,152,219,0.1)", color: "#3498db", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
              <i className="fa-solid fa-cart-shopping"></i>
            </div>
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Tổng số đơn hàng</span>
              <h3 style={{ fontSize: "1.35rem", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>{orders.length} đơn</h3>
            </div>
          </div>

          <div className="metric-card" style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: "20px" }}>
            <div className="metric-icon" style={{ width: "54px", height: "54px", borderRadius: "12px", background: "rgba(155,89,182,0.1)", color: "#9b59b6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Khách hàng</span>
              <h3 style={{ fontSize: "1.35rem", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>{users.length} thành viên</h3>
            </div>
          </div>

          <div className="metric-card" style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: "20px" }}>
            <div className="metric-icon" style={{ width: "54px", height: "54px", borderRadius: "12px", background: "rgba(230,126,34,0.1)", color: "#e67e22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
              <i className="fa-solid fa-boxes-stacked"></i>
            </div>
            <div>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Tổng số sản phẩm</span>
              <h3 style={{ fontSize: "1.35rem", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>{products.length} mã</h3>
            </div>
          </div>

        </div>

        {/* Chart + Recent Orders Area */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "30px" }}>
          
          {/* Revenue Chart Section */}
          <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.04)" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--text-main)", marginBottom: "20px" }}>Biểu đồ doanh thu 6 tháng đầu năm</h2>
            
            {/* SVG Chart from admin.html */}
            <div style={{ width: "100%", overflowX: "auto" }}>
              <svg viewBox="0 0 800 300" width="100%" height="220" style={{ minWidth: "600px" }}>
                {/* Grid Lines */}
                <line x1="50" y1="50" x2="750" y2="50" stroke="#f1f2f6" strokeWidth="1" />
                <line x1="50" y1="110" x2="750" y2="110" stroke="#f1f2f6" strokeWidth="1" />
                <line x1="50" y1="170" x2="750" y2="170" stroke="#f1f2f6" strokeWidth="1" />
                <line x1="50" y1="230" x2="750" y2="230" stroke="#f1f2f6" strokeWidth="1" />
                <line x1="50" y1="260" x2="750" y2="260" stroke="#ddd" strokeWidth="1.5" />

                {/* Y-Axis labels */}
                <text x="40" y="55" textAnchor="end" fill="#999" fontSize="12">12M</text>
                <text x="40" y="115" textAnchor="end" fill="#999" fontSize="12">8M</text>
                <text x="40" y="175" textAnchor="end" fill="#999" fontSize="12">4M</text>
                <text x="40" y="235" textAnchor="end" fill="#999" fontSize="12">1M</text>
                <text x="40" y="265" textAnchor="end" fill="#999" fontSize="12">0</text>

                {/* Bars for Revenue */}
                <rect x="95" y="150" width="40" height="110" rx="4" fill="var(--primary-color)" opacity="0.85" />
                <rect x="205" y="120" width="40" height="140" rx="4" fill="var(--primary-color)" opacity="0.85" />
                <rect x="315" y="80" width="40" height="180" rx="4" fill="var(--primary-color)" opacity="0.85" />
                <rect x="425" y="140" width="40" height="120" rx="4" fill="var(--primary-color)" opacity="0.85" />
                <rect x="535" y="100" width="40" height="160" rx="4" fill="var(--primary-color)" opacity="0.85" />
                <rect x="645" y="60" width="40" height="200" rx="4" fill="var(--primary-color)" opacity="0.85" />

                {/* X-Axis labels */}
                <text x="115" y="285" textAnchor="middle" fill="#666" fontSize="12">Tháng 1</text>
                <text x="225" y="285" textAnchor="middle" fill="#666" fontSize="12">Tháng 2</text>
                <text x="335" y="285" textAnchor="middle" fill="#666" fontSize="12">Tháng 3</text>
                <text x="445" y="285" textAnchor="middle" fill="#666" fontSize="12">Tháng 4</text>
                <text x="555" y="285" textAnchor="middle" fill="#666" fontSize="12">Tháng 5</text>
                <text x="665" y="285" textAnchor="middle" fill="#666" fontSize="12">Tháng 6</text>
              </svg>
            </div>
          </div>

          {/* Orders Management Table */}
          <div style={{ background: "#fff", padding: "30px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.04)" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--text-main)", marginBottom: "20px" }}>Quản Lý Trạng Thái Đơn Hàng</h2>
            
            {orders.length === 0 ? (
              <div className="empty-state" style={{ padding: "30px 0" }}>
                <i className="fa-solid fa-receipt" style={{ fontSize: "2.5rem", color: "var(--text-muted)", opacity: 0.4 }}></i>
                <h3>Chưa có đơn hàng nào trên hệ thống</h3>
                <p>Khách mua hàng sẽ tạo đơn tự động lưu trữ tại đây.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="orders-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
                  <thead>
                    <tr style={{ background: "rgba(0,0,0,0.02)", textAlign: "left" }}>
                      <th style={{ padding: "12px 16px", fontWeight: "600" }}>Mã đơn</th>
                      <th style={{ padding: "12px 16px", fontWeight: "600" }}>Khách hàng</th>
                      <th style={{ padding: "12px 16px", fontWeight: "600" }}>Sản phẩm</th>
                      <th style={{ padding: "12px 16px", fontWeight: "600" }}>Tổng tiền</th>
                      <th style={{ padding: "12px 16px", fontWeight: "600" }}>Trạng thái</th>
                      <th style={{ padding: "12px 16px", fontWeight: "600", textAlign: "center" }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        <td style={{ padding: "16px", fontWeight: "600", color: "var(--primary-color)" }}>{order.id}</td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ fontWeight: "600" }}>{order.shippingInfo?.name || "Khách"}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{order.shippingInfo?.phone}</div>
                        </td>
                        <td style={{ padding: "16px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={order.products}>{order.products}</td>
                        <td style={{ padding: "16px", fontWeight: "600" }}>{formatPrice(order.total)}</td>
                        <td style={{ padding: "16px" }}>
                          <span className={`status-badge ${order.status}`} style={{
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "0.82rem",
                            fontWeight: "500",
                            background: order.status === "completed" ? "rgba(60,98,85,0.1)" : order.status === "shipping" ? "rgba(255,193,7,0.15)" : "rgba(0,0,0,0.04)",
                            color: order.status === "completed" ? "var(--primary-color)" : order.status === "shipping" ? "darkgoldenrod" : "var(--text-muted)"
                          }}>
                            {order.statusName}
                          </span>
                        </td>
                        <td style={{ padding: "16px", textAlign: "center" }}>
                          {order.status !== "completed" ? (
                            <button
                              onClick={() => adminCycleOrderStatus(order.id)}
                              className="btn"
                              style={{
                                padding: "6px 12px",
                                fontSize: "0.8rem",
                                background: order.status === "processing" ? "#3498db" : "var(--primary-color)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontWeight: "600"
                              }}
                            >
                              {order.status === "processing" ? "Giao hàng" : "Hoàn thành"}
                            </button>
                          ) : (
                            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Đã đóng đơn</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
