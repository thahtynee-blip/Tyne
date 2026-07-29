"use client";

import React, { useState, useEffect, useContext, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppContext } from "../../context/AppContext";
import ProductCard from "../../components/ProductCard";
import Link from "next/link";

function ProductsPageContent() {
  const { products, isClient } = useContext(AppContext);
  const searchParams = useSearchParams();

  // --- States ---
  const [activeCategories, setActiveCategories] = useState([]);
  const [maxPrice, setMaxPrice] = useState(1500000);
  const [minRating, setMinRating] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSort, setCurrentSort] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  // Sync category param from URL on load
  useEffect(() => {
    const catParam = searchParams.get("category");
    if (catParam) {
      setActiveCategories([catParam]);
    } else {
      setActiveCategories([]);
    }

    const searchParam = searchParams.get("search");
    if (searchParam) {
      setSearchQuery(searchParam);
    } else {
      setSearchQuery("");
    }

    setCurrentPage(1);
  }, [searchParams]);

  // --- Filter and Sort Logic ---
  const filteredProducts = products.filter((product) => {
    const matchCategory =
      activeCategories.length === 0 || activeCategories.includes(product.category);
    const matchPrice = product.price <= maxPrice;
    const matchRating = minRating === 0 || product.rating >= minRating;
    const matchSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchPrice && matchRating && matchSearch;
  });

  // Sort
  const sortedProducts = [...filteredProducts];
  if (currentSort === "price-asc") {
    sortedProducts.sort((a, b) => a.price - b.price);
  } else if (currentSort === "price-desc") {
    sortedProducts.sort((a, b) => b.price - a.price);
  } else if (currentSort === "rating-desc") {
    sortedProducts.sort((a, b) => b.rating - a.rating);
  }

  // Paginate
  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatPrice = (amount) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  const handleCategoryCheckboxChange = (catCode, checked) => {
    setCurrentPage(1);
    if (checked) {
      setActiveCategories((prev) => [...prev, catCode]);
    } else {
      setActiveCategories((prev) => prev.filter((item) => item !== catCode));
    }
  };

  const clearAllFilters = () => {
    setActiveCategories([]);
    setMaxPrice(1500000);
    setMinRating(0);
    setSearchQuery("");
    setCurrentSort("default");
    setCurrentPage(1);
  };

  const handleOpenDetail = (product) => {
    if (typeof window !== "undefined" && window.openProductDetail) {
      window.openProductDetail(product);
    }
  };

  return (
    <main className="container">
      {/* Breadcrumbs */}
      <div className="breadcrumb-container" style={{ margin: "20px 0", fontSize: "0.9rem", color: "var(--text-muted)", display: "flex", gap: "8px", alignItems: "center" }}>
        <Link href="/" style={{ textDecoration: "none" }}>Trang chủ</Link>
        <span><i className="fa-solid fa-chevron-right" style={{ fontSize: "0.7rem" }}></i></span>
        <span style={{ color: "var(--primary-color)", fontWeight: "500" }}>Cửa Hàng</span>
      </div>

      <div className="products-layout" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "30px", marginBottom: "60px" }}>
        
        {/* Sidebar Filters */}
        <aside className="products-sidebar" style={{ background: "#fff", padding: "24px", borderRadius: "var(--border-radius-md)", border: "1px solid rgba(0,0,0,0.04)", height: "fit-content" }}>
          
          {/* Category Filter */}
          <div className="filter-group" style={{ marginBottom: "28px" }}>
            <h3 className="filter-title" style={{ fontSize: "1.05rem", fontWeight: "600", borderBottom: "2px solid rgba(60,98,85,0.1)", paddingBottom: "10px", marginBottom: "16px" }}>Danh Mục</h3>
            <div className="filter-options" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.95rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  value="do-thu-cong"
                  checked={activeCategories.includes("do-thu-cong")}
                  onChange={(e) => handleCategoryCheckboxChange("do-thu-cong", e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "var(--primary-color)" }}
                />
                Đồ Thủ Công
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.95rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  value="do-my-nghe"
                  checked={activeCategories.includes("do-my-nghe")}
                  onChange={(e) => handleCategoryCheckboxChange("do-my-nghe", e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "var(--primary-color)" }}
                />
                Đồ Mỹ Nghệ
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.95rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  value="noi-that-gia-dung"
                  checked={activeCategories.includes("noi-that-gia-dung")}
                  onChange={(e) => handleCategoryCheckboxChange("noi-that-gia-dung", e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "var(--primary-color)" }}
                />
                Nội Thất & Gia Dụng
              </label>
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-group" style={{ marginBottom: "28px" }}>
            <h3 className="filter-title" style={{ fontSize: "1.05rem", fontWeight: "600", borderBottom: "2px solid rgba(60,98,85,0.1)", paddingBottom: "10px", marginBottom: "16px" }}>Khoảng Giá</h3>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px" }}>
              <span>0đ</span>
              <span style={{ color: "var(--primary-color)", fontWeight: "600" }}>{formatPrice(maxPrice)}</span>
            </div>
            <input
              type="range"
              min="100000"
              max="4000000"
              step="50000"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(Number(e.target.value)); setCurrentPage(1); }}
              style={{ width: "100%", accentColor: "var(--primary-color)" }}
            />
          </div>

          {/* Rating Filter */}
          <div className="filter-group" style={{ marginBottom: "28px" }}>
            <h3 className="filter-title" style={{ fontSize: "1.05rem", fontWeight: "600", borderBottom: "2px solid rgba(60,98,85,0.1)", paddingBottom: "10px", marginBottom: "16px" }}>Đánh Giá</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.95rem", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === 0}
                  onChange={() => { setMinRating(0); setCurrentPage(1); }}
                  style={{ width: "18px", height: "18px", accentColor: "var(--primary-color)" }}
                />
                Tất cả đánh giá
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.95rem", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === 4.8}
                  onChange={() => { setMinRating(4.8); setCurrentPage(1); }}
                  style={{ width: "18px", height: "18px", accentColor: "var(--primary-color)" }}
                />
                Từ 4.8 <i className="fa-solid fa-star" style={{ color: "#FFC107", fontSize: "0.85rem" }}></i> trở lên
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.95rem", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === 4.9}
                  onChange={() => { setMinRating(4.9); setCurrentPage(1); }}
                  style={{ width: "18px", height: "18px", accentColor: "var(--primary-color)" }}
                />
                Từ 4.9 <i className="fa-solid fa-star" style={{ color: "#FFC107", fontSize: "0.85rem" }}></i> trở lên
              </label>
            </div>
          </div>

          <button
            className="btn"
            onClick={clearAllFilters}
            style={{ width: "100%", background: "none", border: "1px solid var(--primary-color)", color: "var(--primary-color)", transition: "all 0.2s" }}
            onMouseOver={(e) => { e.target.style.background = "var(--primary-color)"; e.target.style.color = "#fff"; }}
            onMouseOut={(e) => { e.target.style.background = "none"; e.target.style.color = "var(--primary-color)"; }}
          >
            Xóa Toàn Bộ Lọc
          </button>
        </aside>

        {/* Products Grid & Sorting Area */}
        <section className="products-content-area" style={{ display: "flex", flexDirection: "column" }}>
          
          {/* Top Info bar */}
          <div className="products-top-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", background: "#fff", borderRadius: "var(--border-radius-md)", border: "1px solid rgba(0,0,0,0.04)", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ fontSize: "0.95rem", color: "var(--text-muted)" }}>
              Hiển thị <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{isClient ? filteredProducts.length : 0}</span> trên tổng số <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{isClient ? products.length : 0}</span> sản phẩm
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <label htmlFor="sort-select" style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Sắp xếp:</label>
              <select
                id="sort-select"
                value={currentSort}
                onChange={(e) => { setCurrentSort(e.target.value); setCurrentPage(1); }}
                style={{ padding: "8px 16px", borderRadius: "var(--border-radius-sm)", border: "1px solid rgba(0,0,0,0.1)", background: "#fff", outline: "none", fontSize: "0.9rem", cursor: "pointer" }}
              >
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
                <option value="rating-desc">Đánh giá cao nhất</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="product-grid">
            {isClient && paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDetailOpen={handleOpenDetail}
              />
            ))}
          </div>

          {/* Empty state */}
          {isClient && totalItems === 0 && (
            <div className="empty-state">
              <i className="fa-regular fa-face-frown-open"></i>
              <h3>Không tìm thấy sản phẩm nào</h3>
              <p>Thử điều chỉnh lại bộ lọc giá hoặc chọn danh mục khác nhé.</p>
            </div>
          )}

          {/* Pagination */}
          {isClient && totalPages > 1 && (
            <div className="pagination" style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "40px" }}>
              <button
                className="pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1px solid rgba(0,0,0,0.08)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: currentPage === 1 ? 0.5 : 1 }}
              >
                <i className="fa-solid fa-angle-left"></i>
              </button>
              
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    border: "none",
                    background: currentPage === idx + 1 ? "var(--primary-color)" : "#fff",
                    color: currentPage === idx + 1 ? "#fff" : "var(--text-main)",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: currentPage === idx + 1 ? "none" : "var(--shadow-sm)",
                    border: currentPage === idx + 1 ? "none" : "1px solid rgba(0,0,0,0.08)"
                  }}
                >
                  {idx + 1}
                </button>
              ))}

              <button
                className="pagination-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1px solid rgba(0,0,0,0.08)", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: currentPage === totalPages ? 0.5 : 1 }}
              >
                <i className="fa-solid fa-angle-right"></i>
              </button>
            </div>
          )}

        </section>
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "80px 24px", textAlign: "center" }}>Đang tải cửa hàng...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}
