"use client";

import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import Link from "next/link";

export default function Home() {
  const { products, isClient } = useContext(AppContext);
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "Tất Cả" },
    { id: "do-thu-cong", name: "Đồ Thủ Công" },
    { id: "do-my-nghe", name: "Đồ Mỹ Nghệ" },
    { id: "noi-that-gia-dung", name: "Nội Thất & Gia Dụng" }
  ];

  // Filter products based on active category
  const filteredProducts = products.filter(
    (p) => activeCategory === "all" || p.category === activeCategory
  );

  const handleOpenDetail = (product) => {
    if (typeof window !== "undefined" && window.openProductDetail) {
      window.openProductDetail(product);
    }
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <span className="hero-tag">Bộ Sưu Tập Mới 2026</span>
            <h1 className="hero-title">Kiến tạo không gian mộc mạc & tinh tế</h1>
            <p className="hero-subtitle">Mỗi sản phẩm tại MiniShop đều được hoàn thiện tỉ mỉ từ vật liệu tự nhiên, mang hơi thở ấm áp, thanh lành vào tổ ấm của bạn.</p>
            <div className="hero-actions">
              <Link href="/products" className="btn btn-primary">Mua ngay <i className="fa-solid fa-arrow-right"></i></Link>
              <Link href="/info" className="btn btn-outline">Tìm hiểu thêm</Link>
            </div>
          </div>
          <div className="hero-image-container">
            <img src="/assets/images/banner/banner-trang-chu-mini-shop.jpg" alt="MiniShop Banner Cảm Hứng Không Gian Sống Mộc Mạc" className="hero-image" />
            <div className="hero-floating-card">
              <i className="fa-solid fa-leaf"></i>
              <div>
                <h4>100% Tự Nhiên</h4>
                <p>Thân thiện môi trường</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs Section */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Khám Phá Danh Mục</h2>
          <div className="category-tabs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-tab ${activeCategory === cat.id ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid Section */}
      <section className="products-section">
        <div className="container">
          <div id="product-grid" className="product-grid">
            {isClient && filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDetailOpen={handleOpenDetail}
              />
            ))}
          </div>

          {isClient && filteredProducts.length === 0 && (
            <div id="empty-state" className="empty-state">
              <i className="fa-regular fa-face-frown-open"></i>
              <h3>Không tìm thấy sản phẩm nào</h3>
              <p>Danh mục này hiện chưa có sản phẩm. Vui lòng quay lại sau.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
