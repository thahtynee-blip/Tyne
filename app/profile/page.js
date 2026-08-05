"use client";

import React, { useState, useEffect, useContext, Suspense } from "react";
import { AppContext } from "../../context/AppContext";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "../../components/ProductCard";
import Link from "next/link";

function ProfilePageContent() {
  const {
    isClient,
    authLoading,
    loggedInUser,
    logoutUser,
    products,
    wishlist,
    orders,
    updateProfile,
    changePassword
  } = useContext(AppContext);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Active Tab State
  const [activeTab, setActiveTab] = useState("profile-info");

  // Form profile states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Form security states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Tab Sync from Query Param
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Sync user profile inputs
  useEffect(() => {
    if (loggedInUser) {
      setName(loggedInUser.name || "");
      setPhone(loggedInUser.phone || "");
      setAddress(loggedInUser.address || "");
    }
  }, [loggedInUser]);

  // Auth Protection (only runs on client side after auth check completes)
  useEffect(() => {
    if (isClient && !authLoading) {
      if (!loggedInUser) {
        alert("Vui lòng đăng nhập để truy cập trang cá nhân.");
        router.push("/login");
      } else if (loggedInUser.role === "admin") {
        alert("Tài khoản Admin không có quyền truy cập trang cá nhân khách hàng.");
        router.push("/admin");
      }
    }
  }, [loggedInUser, isClient, authLoading, router]);

  if (!isClient || authLoading || !loggedInUser || loggedInUser.role === "admin") {
    return <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>Đang tải thông tin tài khoản...</div>;
  }

  // --- Handlers ---
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Họ tên không được để trống!");
      return;
    }
    updateProfile(name.trim(), phone.trim(), address.trim());
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert("Mật khẩu mới phải chứa ít nhất 6 ký tự!");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Xác nhận mật khẩu mới không khớp!");
      return;
    }

    const success = await changePassword(oldPassword, newPassword);
    if (success) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const formatPrice = (amount) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  // Filter orders for logged-in user
  const userOrders = orders.filter(
    (order) => order.userEmail?.toLowerCase() === loggedInUser.email?.toLowerCase()
  );

  // Filter wishlist products
  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const handleOpenDetail = (product) => {
    if (typeof window !== "undefined" && window.openProductDetail) {
      window.openProductDetail(product);
    }
  };

  return (
    <div className="container profile-layout" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "30px", margin: "40px auto 60px" }}>
      {/* Sidebar Navigation */}
      <aside className="profile-sidebar" style={{ background: "#fff", padding: "24px", borderRadius: "var(--border-radius-md)", border: "1px solid rgba(0,0,0,0.04)", height: "fit-content" }}>
        
        {/* User Card Avatar info */}
        <div className="profile-user-card" style={{ display: "flex", gap: "12px", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.06)", paddingBottom: "20px", marginBottom: "20px" }}>
          <div className="avatar" style={{ width: "48px", height: "48px", background: "rgba(60,98,85,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-color)", fontSize: "1.2rem", fontWeight: "600" }}>
            {loggedInUser.name ? loggedInUser.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <h4 style={{ fontWeight: "600", fontSize: "1.05rem", color: "var(--text-main)", margin: 0 }}>{loggedInUser.name}</h4>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{loggedInUser.email}</span>
          </div>
        </div>

        {/* Tab items list */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            className={`profile-menu-item ${activeTab === "profile-info" ? "active" : ""}`}
            onClick={() => setActiveTab("profile-info")}
            style={{ background: "none", border: "none", textAlign: "left", width: "100%", cursor: "pointer" }}
          >
            <i className="fa-regular fa-user"></i> Hồ sơ cá nhân
          </button>
          <button
            className={`profile-menu-item ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
            style={{ background: "none", border: "none", textAlign: "left", width: "100%", cursor: "pointer" }}
          >
            <i className="fa-solid fa-clock-rotate-left"></i> Đơn hàng của tôi
          </button>
          <button
            className={`profile-menu-item ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
            style={{ background: "none", border: "none", textAlign: "left", width: "100%", cursor: "pointer" }}
          >
            <i className="fa-solid fa-lock"></i> Đổi mật khẩu
          </button>
          <button
            className={`profile-menu-item ${activeTab === "wishlist" ? "active" : ""}`}
            onClick={() => setActiveTab("wishlist")}
            style={{ background: "none", border: "none", textAlign: "left", width: "100%", cursor: "pointer" }}
          >
            <i className="fa-regular fa-heart"></i> Sản phẩm yêu thích
          </button>
        </nav>
      </aside>

      {/* Main tab display card content */}
      <main className="profile-content-area" style={{ background: "#fff", padding: "40px", borderRadius: "var(--border-radius-md)", border: "1px solid rgba(0,0,0,0.04)" }}>
        
        {/* Tab 1: Profile Info Form */}
        {activeTab === "profile-info" && (
          <div className="profile-content-card" id="tab-profile-info">
            <h2 className="profile-card-title" style={{ fontSize: "1.3rem", fontWeight: "600", color: "var(--text-main)", marginBottom: "28px" }}>Thông Tin Cá Nhân</h2>
            <form onSubmit={handleProfileSubmit} className="auth-form" style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "600px" }}>
              <div className="form-group">
                <label>Họ và Tên</label>
                <div className="form-input-wrapper">
                  <i className="fa-regular fa-user" style={{ left: "16px" }}></i>
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: "46px" }}
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Địa chỉ Email (Không thể sửa)</label>
                <div className="form-input-wrapper">
                  <i className="fa-regular fa-envelope" style={{ left: "16px" }}></i>
                  <input
                    type="email"
                    className="form-control"
                    style={{ paddingLeft: "46px", background: "rgba(0,0,0,0.02)", cursor: "not-allowed" }}
                    value={loggedInUser.email}
                    disabled
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Số điện thoại</label>
                <div className="form-input-wrapper">
                  <i className="fa-solid fa-phone" style={{ left: "16px" }}></i>
                  <input
                    type="tel"
                    className="form-control"
                    style={{ paddingLeft: "46px" }}
                    placeholder="Nhập số điện thoại"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Địa chỉ nhận hàng mặc định</label>
                <div className="form-input-wrapper">
                  <i className="fa-solid fa-map-location-dot" style={{ left: "16px" }}></i>
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: "46px" }}
                    placeholder="Số nhà, Tên đường, Quận, Thành phố..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start", minWidth: "180px", padding: "12px 24px" }}>
                Lưu Thay Đổi
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Orders History */}
        {activeTab === "orders" && (
          <div className="profile-content-card" id="tab-orders">
            <h2 className="profile-card-title" style={{ fontSize: "1.3rem", fontWeight: "600", color: "var(--text-main)", marginBottom: "28px" }}>Đơn Hàng Của Tôi</h2>
            {userOrders.length === 0 ? (
              <div className="empty-state" style={{ padding: "40px 0" }}>
                <i className="fa-solid fa-basket-shopping" style={{ fontSize: "2.5rem", color: "var(--text-muted)", opacity: 0.5 }}></i>
                <h3>Bạn chưa có đơn hàng nào</h3>
                <p>Khám phá bộ sưu tập và chọn những sản phẩm ưng ý nhất nhé!</p>
                <Link href="/products" className="btn btn-primary" style={{ textDecoration: "none", display: "inline-block", marginTop: "12px" }}>Mua sắm ngay</Link>
              </div>
            ) : (
              <div className="orders-table-wrapper" style={{ overflowX: "auto" }}>
                <table className="orders-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                  <thead>
                    <tr style={{ background: "rgba(0,0,0,0.02)", textAlign: "left" }}>
                      <th style={{ padding: "12px 16px", fontWeight: "600" }}>Mã đơn hàng</th>
                      <th style={{ padding: "12px 16px", fontWeight: "600" }}>Ngày đặt</th>
                      <th style={{ padding: "12px 16px", fontWeight: "600" }}>Sản phẩm</th>
                      <th style={{ padding: "12px 16px", fontWeight: "600" }}>Tổng thanh toán</th>
                      <th style={{ padding: "12px 16px", fontWeight: "600" }}>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userOrders.map((order) => (
                      <tr key={order.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        <td style={{ padding: "16px", fontWeight: "600", color: "var(--primary-color)" }}>{order.id}</td>
                        <td style={{ padding: "16px" }}>{order.date}</td>
                        <td style={{ padding: "16px", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={order.products}>{order.products}</td>
                        <td style={{ padding: "16px", fontWeight: "600" }}>{formatPrice(order.total)}</td>
                        <td style={{ padding: "16px" }}>
                          <span className={`status-badge ${order.status}`} style={{
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "0.85rem",
                            fontWeight: "500",
                            background: order.status === "completed" ? "rgba(60,98,85,0.1)" : order.status === "shipping" ? "rgba(255,193,7,0.15)" : "rgba(0,0,0,0.04)",
                            color: order.status === "completed" ? "var(--primary-color)" : order.status === "shipping" ? "darkgoldenrod" : "var(--text-muted)"
                          }}>
                            {order.statusName}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Change Password */}
        {activeTab === "security" && (
          <div className="profile-content-card" id="tab-security">
            <h2 className="profile-card-title" style={{ fontSize: "1.3rem", fontWeight: "600", color: "var(--text-main)", marginBottom: "28px" }}>Đổi Mật Khẩu</h2>
            <form onSubmit={handleSecuritySubmit} className="auth-form" style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "600px" }}>
              <div className="form-group">
                <label>Mật khẩu hiện tại</label>
                <div className="form-input-wrapper">
                  <i className="fa-solid fa-lock-open" style={{ left: "16px" }}></i>
                  <input
                    type="password"
                    className="form-control"
                    style={{ paddingLeft: "46px" }}
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mật khẩu mới (Tối thiểu 6 ký tự)</label>
                <div className="form-input-wrapper">
                  <i className="fa-solid fa-lock" style={{ left: "16px" }}></i>
                  <input
                    type="password"
                    className="form-control"
                    style={{ paddingLeft: "46px" }}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Xác nhận mật khẩu mới</label>
                <div className="form-input-wrapper">
                  <i className="fa-solid fa-lock" style={{ left: "16px" }}></i>
                  <input
                    type="password"
                    className="form-control"
                    style={{ paddingLeft: "46px" }}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start", minWidth: "180px", padding: "12px 24px" }}>
                Thay Đổi Mật Khẩu
              </button>
            </form>
          </div>
        )}

        {/* Tab 4: Wishlist Products Grid */}
        {activeTab === "wishlist" && (
          <div className="profile-content-card" id="tab-wishlist">
            <h2 className="profile-card-title" style={{ fontSize: "1.3rem", fontWeight: "600", color: "var(--text-main)", marginBottom: "28px" }}>Sản Phẩm Yêu Thích Của Tôi</h2>
            {wishlistProducts.length === 0 ? (
              <div className="wishlist-empty" style={{ textAlign: "center", padding: "50px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                <i className="fa-regular fa-heart" style={{ fontSize: "3rem", color: "var(--primary-color)", opacity: 0.3 }}></i>
                <h3>Danh sách yêu thích trống</h3>
                <p>Hãy khám phá cửa hàng và lưu lại những sản phẩm bạn yêu thích nhé.</p>
                <Link href="/products" className="btn btn-primary" style={{ textDecoration: "none", display: "inline-block", padding: "10px 24px" }}>Khám phá ngay</Link>
              </div>
            ) : (
              <div className="product-grid">
                {wishlistProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onDetailOpen={handleOpenDetail}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>Đang tải trang cá nhân...</div>}>
      <ProfilePageContent />
    </Suspense>
  );
}
