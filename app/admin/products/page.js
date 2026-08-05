"use client";

import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../context/AppContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const AVAILABLE_IMAGES = [
  { value: "/assets/images/products/do-thu-cong/gio-may-dan.jpg", label: "Giỏ mây đan (Đồ thủ công)" },
  { value: "/assets/images/products/do-thu-cong/khay-go-hoa-van.jpg", label: "Khay gỗ hoa văn (Đồ thủ công)" },
  { value: "/assets/images/products/do-thu-cong/khay-go-trang-tri.jpg", label: "Khay gỗ trang trí (Đồ thủ công)" },
  { value: "/assets/images/products/do-thu-cong/tranh-treo-macrame.jpg", label: "Tranh treo Macrame (Đồ thủ công)" },
  
  { value: "/assets/images/products/do-my-nghe/binh-gom-trang-tri.jpg", label: "Bình gốm trang trí (Đồ mỹ nghệ)" },
  { value: "/assets/images/products/do-my-nghe/bo-binh-gom-minimal.jpg", label: "Bộ bình gốm Minimal (Đồ mỹ nghệ)" },
  { value: "/assets/images/products/do-my-nghe/den-long-tre.jpg", label: "Đèn lồng tre (Đồ mỹ nghệ)" },
  { value: "/assets/images/products/do-my-nghe/den-tre-thu-cong.jpg", label: "Đèn tre thủ công (Đồ mỹ nghệ)" },
  { value: "/assets/images/products/do-my-nghe/hop-son-mai.png", label: "Hộp sơn mài (Đồ mỹ nghệ)" },
  { value: "/assets/images/products/do-my-nghe/khay-kham-trai.png", label: "Khay khảm trai (Đồ mỹ nghệ)" },
  
  { value: "/assets/images/products/noi-that-gia-dung/bo-ban-an-go.jpg", label: "Bộ bàn ăn gỗ (Nội thất)" },
  { value: "/assets/images/products/noi-that-gia-dung/chau-cay-de-ban.jpg", label: "Chậu cây để bàn (Nội thất)" },
  { value: "/assets/images/products/noi-that-gia-dung/ke-go-trang-tri.jpg", label: "Kệ gỗ trang trí (Nội thất)" },
  { value: "/assets/images/products/noi-that-gia-dung/sofa-phong-khach.jpg", label: "Sofa phòng khách (Nội thất)" }
];

export default function AdminProductsPage() {
  const {
    isClient,
    loggedInUser,
    logoutUser,
    products,
    adminAddProduct,
    adminUpdateProduct,
    adminDeleteProduct
  } = useContext(AppContext);

  const router = useRouter();

  // Protect page
  useEffect(() => {
    if (isClient && (!loggedInUser || loggedInUser.role !== "admin")) {
      alert("Quyền truy cập bị từ chối. Chỉ dành cho Quản trị viên.");
      router.push("/login");
    }
  }, [loggedInUser, isClient]);

  // --- CRUD states ---
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means adding

  // Form Fields
  const [name, setName] = useState("");
  const [category, setCategory] = useState("do-thu-cong");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  
  // Specs Fields
  const [material, setMaterial] = useState("");
  const [size, setSize] = useState("");
  const [origin, setOrigin] = useState("");
  const [care, setCare] = useState("");

  if (!isClient || !loggedInUser || loggedInUser.role !== "admin") {
    return <div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>Đang tải trang quản lý sản phẩm...</div>;
  }

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName("");
    setCategory("do-thu-cong");
    setPrice("");
    setDescription("");
    setImage("");
    setImagePreview("");
    setMaterial("");
    setSize("");
    setOrigin("");
    setCare("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setName(prod.name || "");
    setCategory(prod.category || "do-thu-cong");
    setPrice(prod.price || "");
    setDescription(prod.description || "");
    setImage(prod.image || "");
    setImagePreview(prod.image || "");
    setMaterial(prod.specs?.["Chất liệu"] || "");
    setSize(prod.specs?.["Kích thước"] || "");
    setOrigin(prod.specs?.["Xuất xứ"] || "");
    setCare(prod.specs?.["Hướng dẫn bảo quản"] || "");
    setIsModalOpen(true);
  };

  // Image Upload File Reader logic (Base64)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteClick = (productId) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
      adminDeleteProduct(productId);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !price || !description.trim()) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Giá sản phẩm phải là một số lớn hơn 0!");
      return;
    }

    const categoryNames = {
      "do-thu-cong": "Đồ thủ công",
      "do-my-nghe": "Đồ mỹ nghệ",
      "noi-that-gia-dung": "Nội Thất & Gia Dụng"
    };

    const finalProduct = {
      id: editingProduct ? editingProduct.id : (products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1),
      name: name.trim(),
      category: category,
      categoryName: categoryNames[category],
      price: priceNum,
      image: image || "/assets/images/placeholder.jpg",
      description: description.trim(),
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 0,
      specs: {
        "Chất liệu": material.trim() || "Tự nhiên",
        "Kích thước": size.trim() || "Nhiều kích cỡ",
        "Xuất xứ": origin.trim() || "Việt Nam",
        "Hướng dẫn bảo quản": care.trim() || "Nơi khô ráo"
      }
    };

    if (editingProduct) {
      adminUpdateProduct(finalProduct);
    } else {
      adminAddProduct(finalProduct);
    }

    setIsModalOpen(false);
  };

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  // Search filter
  const filteredProducts = products.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  });

  const formatPrice = (amount) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  return (
    <div className="admin-layout" style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "90vh" }}>
      
      {/* Sidebar (same design) */}
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
          <Link href="/admin/products" className="admin-menu-item active" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", textDecoration: "none", color: "#fff", background: "#34495e", fontWeight: "600" }}>
            <i className="fa-solid fa-boxes-stacked"></i> Quản lý sản phẩm
          </Link>
          <Link href="/admin/users" className="admin-menu-item" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "8px", textDecoration: "none", color: "#ecf0f1", transition: "all 0.2s" }} onMouseOver={(e) => e.target.style.background = "#34495e"} onMouseOut={(e) => e.target.style.background = "none"}>
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

      {/* Main Content CRUD table */}
      <main className="admin-content" style={{ padding: "40px", background: "#f8f9fa" }}>
        
        {/* Title area + Add Button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "16px" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: "700", color: "var(--text-main)", margin: 0 }}>Quản Lý Kho Sản Phẩm</h1>
          <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px" }}>
            <i className="fa-solid fa-plus"></i> Thêm Sản Phẩm Mới
          </button>
        </div>

        {/* Search & Statistics */}
        <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.04)", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          
          <div className="search-bar" style={{ flex: 1, maxWidth: "400px", margin: 0 }}>
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", paddingLeft: "46px" }}
            />
          </div>

          <div style={{ fontSize: "0.95rem", color: "var(--text-muted)" }}>
            Có tổng cộng <span style={{ fontWeight: "600", color: "var(--text-main)" }}>{filteredProducts.length}</span> sản phẩm được liệt kê
          </div>
        </div>

        {/* Product Table */}
        <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.04)", overflowX: "auto" }}>
          <table className="orders-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.02)", textAlign: "left" }}>
                <th style={{ padding: "12px 16px", fontWeight: "600", width: "80px" }}>Hình ảnh</th>
                <th style={{ padding: "12px 16px", fontWeight: "600" }}>Tên sản phẩm</th>
                <th style={{ padding: "12px 16px", fontWeight: "600" }}>Danh mục</th>
                <th style={{ padding: "12px 16px", fontWeight: "600" }}>Đơn giá</th>
                <th style={{ padding: "12px 16px", fontWeight: "600" }}>Đánh giá</th>
                <th style={{ padding: "12px 16px", fontWeight: "600", textAlign: "center", width: "160px" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((prod) => (
                <tr key={prod.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <img
                      src={prod.image}
                      alt={prod.name}
                      style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "6px" }}
                    />
                  </td>
                  <td style={{ padding: "16px", fontWeight: "600" }}>{prod.name}</td>
                  <td style={{ padding: "16px" }}>{prod.categoryName}</td>
                  <td style={{ padding: "16px", fontWeight: "600", color: "var(--primary-color)" }}>{formatPrice(prod.price)}</td>
                  <td style={{ padding: "16px" }}>
                    <span style={{ color: "#FFC107", fontWeight: "600" }}>
                      <i className="fa-solid fa-star"></i> {prod.rating}
                    </span>
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button
                        onClick={() => handleOpenEditModal(prod)}
                        className="btn"
                        style={{ padding: "6px 12px", fontSize: "0.8rem", background: "none", border: "1px solid #3498db", color: "#3498db", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteClick(prod.id)}
                        className="btn"
                        style={{ padding: "6px 12px", fontSize: "0.8rem", background: "none", border: "1px solid #e74c3c", color: "#e74c3c", borderRadius: "4px", cursor: "pointer", fontWeight: "600" }}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>

      {/* Add / Edit product modal overlay popup */}
      {isModalOpen && (
        <div className="cart-modal open" onClick={() => setIsModalOpen(false)}>
          <div className="cart-modal-content" style={{ maxWidth: "600px", padding: "30px" }} onClick={(e) => e.stopPropagation()}>
            
            <div className="cart-header" style={{ marginBottom: "20px" }}>
              <h3>
                <i className="fa-solid fa-boxes-stacked"></i>{" "}
                {editingProduct ? `Sửa Sản Phẩm: "${editingProduct.name}"` : "Thêm Sản Phẩm Mới"}
              </h3>
              <button className="close-cart-btn" onClick={() => setIsModalOpen(false)} aria-label="Đóng form">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="auth-form" style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "75vh", overflowY: "auto", paddingRight: "10px" }}>
              
              {/* Mandatory fields */}
              <div className="form-group">
                <label>Tên sản phẩm *</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Giỏ mây, Khay gỗ..."
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label>Danh mục *</label>
                  <select
                    className="form-control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ background: "#fff" }}
                  >
                    <option value="do-thu-cong">Đồ thủ công</option>
                    <option value="do-my-nghe">Đồ mỹ nghệ</option>
                    <option value="noi-that-gia-dung">Nội thất & Gia dụng</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Đơn giá (VND) *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="250000"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả sản phẩm *</label>
                <textarea
                  className="form-control"
                  style={{ minHeight: "80px", fontFamily: "inherit", padding: "10px 14px" }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả sơ qua về vẻ đẹp và công dụng của sản phẩm..."
                  required
                />
              </div>

              {/* Image Input Selection + Preview */}
              <div className="form-group" style={{ border: "1px dashed rgba(0,0,0,0.1)", padding: "16px", borderRadius: "8px", background: "rgba(0,0,0,0.01)" }}>
                <label style={{ display: "block", marginBottom: "8px" }}>Hình ảnh sản phẩm (Chọn từ thư viện assets) *</label>
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Xem trước ảnh"
                      style={{ width: "64px", height: "64px", objectFit: "cover", borderRadius: "6px" }}
                    />
                  )}
                  <select
                    className="form-control"
                    value={image}
                    onChange={(e) => {
                      setImage(e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    style={{ background: "#fff", flex: 1 }}
                    required
                  >
                    <option value="">-- Chọn hình ảnh sản phẩm --</option>
                    {AVAILABLE_IMAGES.map((img) => (
                      <option key={img.value} value={img.value}>
                        {img.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Specifications Sub-fields */}
              <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "16px" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-main)", marginBottom: "12px" }}>Thông số kỹ thuật sản phẩm (Tùy chọn)</h4>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label>Chất liệu</label>
                    <input
                      type="text"
                      className="form-control"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      placeholder="Mây đan, Gỗ keo..."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Kích thước</label>
                    <input
                      type="text"
                      className="form-control"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      placeholder="30cm x 15cm..."
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "12px" }}>
                  <div className="form-group">
                    <label>Xuất xứ</label>
                    <input
                      type="text"
                      className="form-control"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="Làng Phú Vinh..."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Hướng dẫn bảo quản</label>
                    <input
                      type="text"
                      className="form-control"
                      value={care}
                      onChange={(e) => setCare(e.target.value)}
                      placeholder="Tránh ngâm nước..."
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "20px", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "20px" }}>
                <button
                  type="button"
                  className="btn"
                  style={{ flex: 1, background: "rgba(0,0,0,0.05)", border: "none" }}
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  Lưu Sản Phẩm
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
